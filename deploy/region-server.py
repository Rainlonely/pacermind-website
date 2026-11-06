#!/usr/bin/env python3
"""Optional same-host country lookup. No outbound requests or request/IP logs."""
import ipaddress
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer


def country_for(address, reader):
    try:
        ip = ipaddress.ip_address(address)
        if not ip.is_global or reader is None:
            return None
        record = reader.get(str(ip)) or {}
        country = record.get('country', {}).get('iso_code')
        return country if isinstance(country, str) and len(country) == 2 and country.isascii() and country.isupper() and country.isalpha() else None
    except (ValueError, TypeError, OSError):
        return None


class Handler(BaseHTTPRequestHandler):
    reader = None

    def log_message(self, *args):
        pass

    def do_GET(self):
        if self.path != '/api/region':
            self.send_error(404)
            return
        # Listener is loopback-only. Nginx MUST overwrite X-Real-IP with $remote_addr.
        country = country_for(self.headers.get('X-Real-IP', ''), self.reader)
        body = json.dumps({'country': country}).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'private, no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    try:
        import maxminddb
        Handler.reader = maxminddb.open_database(os.environ.get('PACERMIND_COUNTRY_DB', '/var/lib/GeoIP/GeoLite2-Country.mmdb'))
    except (ImportError, OSError):
        # Missing database/dependency must leave browser-language fallback usable.
        pass
    server = HTTPServer(('127.0.0.1', 4181), Handler)
    server.serve_forever()
