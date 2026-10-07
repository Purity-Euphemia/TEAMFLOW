from app import app, db, User, Workspace, WorkspaceMember, Project, Task
from werkzeug.security import generate_password_hash

with app.app_context():
    # Check if user exists
    user = User.query.filter_by(email='sugar@gmail.com').first()
    if not user:
        user = User(full_name='Sugar User', email='sugar@gmail.com', password_hash=generate_password_hash('password123'))
        db.session.add(user)
        db.session.commit()
    
    # Check if workspace exists
    ws = Workspace.query.first()
    if not ws:
        ws = Workspace(name='My Workspace')
        db.session.add(ws)
        db.session.commit()
        
        wm = WorkspaceMember(workspace_id=ws.id, user_id=user.id, role='owner')
        db.session.add(wm)
        db.session.commit()
        
        proj = Project(workspace_id=ws.id, name='Website Redesign', description='Redesigning the corporate website.')
        db.session.add(proj)
        db.session.commit()
        
        task = Task(workspace_id=ws.id, project_id=proj.id, assignee_id=user.id, title='Build Homepage', status='In Progress')
        db.session.add(task)
        db.session.commit()

print("Database seeded successfully!")
