import unittest
from models import User, UserPreference, BuildType


class TestUserModel(unittest.TestCase):
    """Test User model"""

    def test_user_creation(self):
        """Test creating a User instance"""
        user = User(
            keycloak_id='test-keycloak-id',
            username='testuser',
            email='test@example.com'
        )

        self.assertEqual(user.keycloak_id, 'test-keycloak-id')
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')

    def test_user_repr(self):
        """Test User string representation"""
        user = User(
            keycloak_id='test-id',
            username='testuser',
            email='test@example.com'
        )

        repr_str = repr(user)
        self.assertIn('testuser', repr_str)


class TestUserPreferenceModel(unittest.TestCase):
    """Test UserPreference model"""

    def test_preference_creation(self):
        """Test creating a UserPreference instance"""
        preference = UserPreference(
            user_id=1,
            build_type=BuildType.GREEDY
        )

        self.assertEqual(preference.user_id, 1)
        self.assertEqual(preference.build_type, BuildType.GREEDY)

    def test_build_type_enum_values(self):
        """Test BuildType enum has correct values"""
        self.assertEqual(BuildType.GREEDY.value, 'greedy')
        self.assertEqual(BuildType.DEFENSIVE.value, 'defensive')
        self.assertEqual(BuildType.OFFENSIVE.value, 'offensive')

    def test_preference_default_greedy(self):
        """Test that default build type is greedy"""
        preference = UserPreference(user_id=1)

        self.assertEqual(preference.build_type, BuildType.GREEDY)


if __name__ == '__main__':
    unittest.main()
