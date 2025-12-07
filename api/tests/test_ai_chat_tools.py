import unittest
from unittest.mock import patch
from ai_chat_tools import (
    get_champion_details,
    get_matchup_analysis,
    generate_best_item_tool
)


class TestChampionDetails(unittest.TestCase):
    """Test champion details functionality"""

    @patch('ai_chat_tools.get_cached_champion_data')
    def test_get_champion_details_valid(self, mock_get_champ_data):
        """Test getting details for a valid champion"""
        mock_get_champ_data.return_value = {
            'Aatrox': {
                'name': 'Aatrox',
                'title': 'the Darkin Blade',
                'tags': ['Fighter', 'Tank'],
                'info': {
                    'attack': 8,
                    'defense': 4,
                    'magic': 3,
                    'difficulty': 4
                },
                'blurb': 'Once honored defenders of Shurima...',
                'partype': 'Blood Well'
            }
        }

        result = get_champion_details('Aatrox')

        self.assertEqual(result['name'], 'Aatrox')
        self.assertEqual(result['title'], 'the Darkin Blade')
        self.assertIn('Fighter', result['tags'])
        self.assertIn('Tank', result['tags'])
        self.assertEqual(result['stats']['attack'], 8)

    @patch('ai_chat_tools.get_cached_champion_data')
    def test_get_champion_details_invalid(self, mock_get_champ_data):
        """Test getting details for an invalid champion"""
        mock_get_champ_data.return_value = {
            'Aatrox': {'name': 'Aatrox'}
        }

        result = get_champion_details('InvalidChampion')

        self.assertIn('error', result)
        self.assertIn('available_champions', result)


class TestMatchupAnalysis(unittest.TestCase):
    """Test matchup analysis functionality"""

    @patch('ai_chat_tools.get_cached_champion_data')
    def test_matchup_analysis_with_tanks(self, mock_get_champ_data):
        """Test matchup analysis recommends anti-tank items"""
        mock_get_champ_data.return_value = {
            'Aatrox': {
                'name': 'Aatrox',
                'tags': ['Fighter', 'Tank'],
                'info': {'attack': 8, 'defense': 4}
            },
            'Malphite': {
                'name': 'Malphite',
                'tags': ['Tank', 'Fighter'],
                'info': {'attack': 5, 'defense': 9}
            },
            'Ornn': {
                'name': 'Ornn',
                'tags': ['Tank', 'Fighter'],
                'info': {'attack': 5, 'defense': 9}
            }
        }

        result = get_matchup_analysis('Aatrox', ['Malphite', 'Ornn'])

        self.assertEqual(result['your_champion']['name'], 'Aatrox')
        self.assertEqual(result['enemy_tag_counts']['Tank'], 2)
        self.assertTrue(
            any('anti-tank' in rec.lower()
                for rec in result['recommendations'])
        )

    @patch('ai_chat_tools.get_cached_champion_data')
    def test_matchup_analysis_with_assassins(self, mock_get_champ_data):
        """Test matchup analysis recommends defensive items vs assassins"""
        mock_get_champ_data.return_value = {
            'Aatrox': {
                'name': 'Aatrox',
                'tags': ['Fighter', 'Tank'],
                'info': {'attack': 8, 'defense': 4}
            },
            'Zed': {
                'name': 'Zed',
                'tags': ['Assassin', 'Fighter'],
                'info': {'attack': 9, 'defense': 2}
            }
        }

        result = get_matchup_analysis('Aatrox', ['Zed'])

        self.assertEqual(result['enemy_tag_counts']['Assassin'], 1)
        self.assertTrue(
            any('defensive' in rec.lower()
                for rec in result['recommendations'])
        )

    @patch('ai_chat_tools.get_cached_champion_data')
    def test_matchup_analysis_invalid_champion(self, mock_get_champ_data):
        """Test matchup analysis with invalid champion"""
        mock_get_champ_data.return_value = {}

        result = get_matchup_analysis('InvalidChampion', ['Zed'])

        self.assertIn('error', result)


class TestGenerateBestItemTool(unittest.TestCase):
    """Test item recommendation functionality"""

    @patch('ai_chat_tools.get_cached_item_data')
    @patch('ai_chat_tools.get_cached_champion_data')
    def test_generate_best_item_basic(self, mock_champ_data, mock_item_data):
        """Test basic item recommendation"""
        mock_champ_data.return_value = {
            'Aatrox': {
                'name': 'Aatrox',
                'tags': ['Fighter', 'Tank'],
                'info': {}
            },
            'Zed': {
                'name': 'Zed',
                'tags': ['Assassin'],
                'info': {}
            }
        }

        mock_item_data.return_value = {
            '3026': {
                'name': 'Guardian Angel',
                'gold': {'total': 2800},
                'tags': ['Armor'],
                'from': ['1037', '1031'],
                'into': []
            },
            '3157': {
                'name': "Zhonya's Hourglass",
                'gold': {'total': 2600},
                'tags': ['Armor'],
                'from': ['3191', '1058'],
                'into': []
            }
        }

        result = generate_best_item_tool(
            champion='Aatrox',
            current_items=[],
            gold=2700,
            enemy_champions=['Zed'],
            enemy_items=[[]],
            game_time=600,
            prefer_full_items=True,
            max_alternatives=3
        )

        self.assertIn('recommended_item', result)
        self.assertIn('alternatives', result)
        self.assertIn('reasoning', result)
        self.assertIn('tag_counts', result)
        self.assertEqual(result['tag_counts']['Assassin'], 1)

    @patch('ai_chat_tools.get_cached_item_data')
    @patch('ai_chat_tools.get_cached_champion_data')
    def test_generate_best_item_excludes_current(
        self,
        mock_champ_data,
        mock_item_data
    ):
        """Test that current items are excluded from recommendations"""
        mock_champ_data.return_value = {
            'Aatrox': {'name': 'Aatrox', 'tags': ['Fighter'], 'info': {}}
        }

        mock_item_data.return_value = {
            '3026': {
                'name': 'Guardian Angel',
                'gold': {'total': 2800},
                'tags': ['Armor'],
                'from': ['1037', '1031'],
                'into': []
            },
            '3157': {
                'name': "Zhonya's Hourglass",
                'gold': {'total': 2600},
                'tags': ['Armor'],
                'from': ['3191', '1058'],
                'into': []
            }
        }

        result = generate_best_item_tool(
            champion='Aatrox',
            current_items=['3026'],
            gold=2700,
            enemy_champions=[],
            enemy_items=[],
            game_time=600,
            exclude_current_items=True
        )

        # Recommended item should not be 3026 (Guardian Angel)
        if result['recommended_item_id']:
            self.assertNotEqual(result['recommended_item_id'], '3026')


if __name__ == '__main__':
    unittest.main()
