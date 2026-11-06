import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location('region', Path(__file__).with_name('region-server.py'))
region = importlib.util.module_from_spec(spec)
spec.loader.exec_module(region)

class Reader:
    def get(self, address):
        return {'country': {'iso_code': 'JP'}}

class CountryTests(unittest.TestCase):
    def test_global_v4_and_v6(self):
        for address in ['8.8.8.8', '2001:4860:4860::8888']:
            self.assertEqual(region.country_for(address, Reader()), 'JP')
    def test_no_private_or_forwarded_lists(self):
        for address in ['127.0.0.1', '10.0.0.1', '::1', '8.8.8.8, 1.1.1.1', '', '<script>']:
            self.assertIsNone(region.country_for(address, Reader()))
    def test_missing_database(self):
        self.assertIsNone(region.country_for('8.8.8.8', None))
    def test_invalid_database_value(self):
        class Bad:
            def get(self, address): return {'country': {'iso_code': 'J1'}}
        self.assertIsNone(region.country_for('8.8.8.8', Bad()))

if __name__ == '__main__': unittest.main()
