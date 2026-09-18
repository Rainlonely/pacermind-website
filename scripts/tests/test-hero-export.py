import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('hero_export',Path(__file__).parents[1]/'export-hero-heatmap.py')
hero=importlib.util.module_from_spec(spec);spec.loader.exec_module(hero)

class HeroExportTests(unittest.TestCase):
    def test_simplification_keeps_corner_and_endpoints(self):
        self.assertEqual(hero.simplify([[0,0],[0.5,0],[1,0],[1,1]]),[[0,0],[1,0],[1,1]])

    def test_disconnected_routes_remain_separate_and_private_fields_are_omitted(self):
        point=lambda lat,lon: {'latitude':lat,'longitude':lon}
        data=hero.export({'routes':[{'workoutId':'private-id','date':123,'note':'private note','coordinateSegments':[[point(45,9),point(45.1,9.1)],[point(35,139),point(35.1,139.1)]]}]},{})
        self.assertEqual(len(data['routes']['features']),2)
        self.assertNotIn('private',str(data))
        self.assertEqual(data['routeCount'],1)
        self.assertEqual(data['routes']['features'][0]['geometry']['coordinates'][0],[9,45])

    def test_place_cache_gaps_use_same_real_location(self):
        data=hero.export({'routes':[]},{'zh-Hans|1|1':{'countryCode':'IT','country':'意大利','city':'米兰','latitude':45,'longitude':9}})
        place=data['places']['en']['cities']['features'][0]
        self.assertEqual(place['properties']['name'],'Milan')
        self.assertEqual(place['geometry']['coordinates'],[9,45])

if __name__=='__main__': unittest.main()
