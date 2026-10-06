import unittest
import json
from app import app, db, User, Workspace, WorkspaceMember, NotificationPreference

class SettingsTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        with app.app_context():
            db.create_all()
            
            # create user 1 (owner)
            user1 = User(full_name='Alice Owner', email='alice@test.com', password_hash='hash123')
            # create user 2 (member)
            user2 = User(full_name='Bob Member', email='bob@test.com', password_hash='hash123')
            db.session.add_all([user1, user2])
            db.session.commit()
            
            ws = Workspace(name='Test Workspace')
            db.session.add(ws)
            db.session.commit()
            
            wm1 = WorkspaceMember(workspace_id=ws.id, user_id=user1.id, role='owner')
            wm2 = WorkspaceMember(workspace_id=ws.id, user_id=user2.id, role='member')
            db.session.add_all([wm1, wm2])
            db.session.commit()
            
            self.user1_id = user1.id
            self.user2_id = user2.id
            self.ws_id = ws.id

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_unauthenticated_requests_rejected(self):
        res = self.client.get('/api/settings/profile')
        self.assertEqual(res.status_code, 401)
        
    def test_update_profile(self):
        with self.client.session_transaction() as sess:
            sess['user_id'] = self.user1_id
            
        res = self.client.patch('/api/settings/profile', json={
            'full_name': 'Alice Updated'
        })
        self.assertEqual(res.status_code, 200)
        
        with app.app_context():
            u = User.query.get(self.user1_id)
            self.assertEqual(u.full_name, 'Alice Updated')
            
    def test_update_workspace_as_owner(self):
        with self.client.session_transaction() as sess:
            sess['user_id'] = self.user1_id
            
        res = self.client.patch('/api/settings/workspace', headers={'X-Workspace-ID': str(self.ws_id)}, json={
            'name': 'Updated WS Name'
        })
        self.assertEqual(res.status_code, 200)
        
        with app.app_context():
            w = Workspace.query.get(self.ws_id)
            self.assertEqual(w.name, 'Updated WS Name')
            
    def test_update_workspace_as_member_rejected(self):
        with self.client.session_transaction() as sess:
            sess['user_id'] = self.user2_id
            
        res = self.client.patch('/api/settings/workspace', headers={'X-Workspace-ID': str(self.ws_id)}, json={
            'name': 'Hacked WS Name'
        })
        self.assertEqual(res.status_code, 403)
        
    def test_notification_preferences(self):
        with self.client.session_transaction() as sess:
            sess['user_id'] = self.user1_id
            
        res = self.client.patch('/api/settings/notifications', json={
            'task_assigned': False
        })
        self.assertEqual(res.status_code, 200)
        
        with app.app_context():
            pref = NotificationPreference.query.filter_by(user_id=self.user1_id).first()
            self.assertFalse(pref.task_assigned)
            self.assertTrue(pref.comments)

if __name__ == '__main__':
    unittest.main()
