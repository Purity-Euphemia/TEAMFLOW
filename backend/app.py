import os
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import re
from datetime import datetime, timezone

app = Flask(__name__)
# Enable CORS for the Vite dev server, allowing credentials (cookies)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

app.config['SECRET_KEY'] = 'dev_secret_key_teamflow_2026'
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'teamflow.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Secure cookie configuration
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False 

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Workspace(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class WorkspaceMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='member') # owner, admin, member

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), default='Planning') # Planning, Active, On Hold, Completed, Archived
    start_date = db.Column(db.DateTime, nullable=True)
    deadline = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ProjectMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    assignee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    priority = db.Column(db.String(20), default='Medium') # Low, Medium, High, Urgent
    status = db.Column(db.String(20), default='todo') # todo, completed
    due_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    target_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

def get_current_workspace(user_id, requested_workspace_id=None):
    # Retrieve all workspaces for user
    memberships = WorkspaceMember.query.filter_by(user_id=user_id).all()
    if not memberships:
        return None, None
    
    workspace_ids = [m.workspace_id for m in memberships]
    
    if requested_workspace_id and int(requested_workspace_id) in workspace_ids:
        ws = Workspace.query.get(int(requested_workspace_id))
        role = next(m.role for m in memberships if m.workspace_id == ws.id)
        return ws, role
    
    # Default to first workspace
    ws = Workspace.query.get(workspace_ids[0])
    role = next(m.role for m in memberships if m.workspace_id == ws.id)
    return ws, role

def log_activity(workspace_id, user_id, action, target_name):
    activity = Activity(workspace_id=workspace_id, user_id=user_id, action=action, target_name=target_name)
    db.session.add(activity)

# --- AUTH ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    full_name = data.get('fullName', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not full_name: return jsonify({"error": "Please enter your full name."}), 400
    if not email: return jsonify({"error": "Please enter your email address."}), 400
    if not password: return jsonify({"error": "Please enter a password."}), 400
    if not is_valid_email(email): return jsonify({"error": "Invalid email format."}), 400
    if len(password) < 8: return jsonify({"error": "Password must be at least 8 characters long."}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user: return jsonify({"error": "Email address already in use."}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(full_name=full_name, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Account created successfully."}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password."}), 401

    session.clear()
    session['user_id'] = user.id

    return jsonify({"message": "Login successful", "user": {"id": user.id, "full_name": user.full_name, "email": user.email}}), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user = require_auth()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"user": {"id": user.id, "full_name": user.full_name, "email": user.email}}), 200


# --- DASHBOARD & WORKSPACE ROUTES ---

@app.route('/api/workspaces', methods=['GET'])
def get_workspaces():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    memberships = WorkspaceMember.query.filter_by(user_id=user.id).all()
    workspaces = []
    for m in memberships:
        ws = Workspace.query.get(m.workspace_id)
        if ws:
            workspaces.append({"id": ws.id, "name": ws.name, "role": m.role})
            
    return jsonify({"workspaces": workspaces})

@app.route('/api/workspaces', methods=['POST'])
def create_workspace():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    name = data.get('name', '').strip()
    if not name: return jsonify({"error": "Workspace name is required"}), 400
    
    workspace = Workspace(name=name)
    db.session.add(workspace)
    db.session.commit()
    
    member = WorkspaceMember(workspace_id=workspace.id, user_id=user.id, role='owner')
    db.session.add(member)
    db.session.commit()
    
    log_activity(workspace.id, user.id, 'created workspace', name)
    db.session.commit()
    
    return jsonify({"id": workspace.id, "name": workspace.name}), 201

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    ws_id = request.args.get('workspace_id')
    workspace, role = get_current_workspace(user.id, ws_id)
    
    if not workspace:
        return jsonify({
            "has_workspace": False,
            "message": "No workspace found"
        }), 200
        
    # Get basic counts
    active_projects_count = Project.query.filter_by(workspace_id=workspace.id, status='active').count()
    my_open_tasks_count = Task.query.filter_by(workspace_id=workspace.id, assignee_id=user.id, status='todo').count()
    completed_tasks_count = Task.query.filter_by(workspace_id=workspace.id, status='completed').count()
    
    now = datetime.utcnow()
    overdue_tasks_count = Task.query.filter(Task.workspace_id == workspace.id, Task.status == 'todo', Task.due_date < now).count()
    
    # Get project progress
    projects = Project.query.filter_by(workspace_id=workspace.id, status='active').all()
    projects_data = []
    for p in projects:
        total_tasks = Task.query.filter_by(project_id=p.id).count()
        completed = Task.query.filter_by(project_id=p.id, status='completed').count()
        progress = int((completed / total_tasks * 100)) if total_tasks > 0 else 0
        projects_data.append({
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "progress": progress,
            "total_tasks": total_tasks,
            "deadline": p.deadline.isoformat() if p.deadline else None
        })
        
    # Get my tasks
    my_tasks = Task.query.filter_by(workspace_id=workspace.id, assignee_id=user.id).order_by(Task.due_date.asc().nulls_last()).limit(5).all()
    my_tasks_data = []
    for t in my_tasks:
        proj = Project.query.get(t.project_id)
        my_tasks_data.append({
            "id": t.id,
            "title": t.title,
            "project_name": proj.name if proj else "No Project",
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "status": t.status
        })
        
    # Get upcoming deadlines
    upcoming = Task.query.filter(Task.workspace_id == workspace.id, Task.status == 'todo', Task.due_date != None).order_by(Task.due_date.asc()).limit(5).all()
    upcoming_data = []
    for t in upcoming:
        proj = Project.query.get(t.project_id)
        upcoming_data.append({
            "id": t.id,
            "title": t.title,
            "project_name": proj.name if proj else "No Project",
            "due_date": t.due_date.isoformat(),
            "status": t.status,
            "priority": t.priority
        })
        
    # Recent activity
    activities = Activity.query.filter_by(workspace_id=workspace.id).order_by(Activity.created_at.desc()).limit(10).all()
    activities_data = []
    for a in activities:
        actor = User.query.get(a.user_id)
        activities_data.append({
            "id": a.id,
            "user_name": actor.full_name if actor else "Unknown",
            "action": a.action,
            "target_name": a.target_name,
            "created_at": a.created_at.isoformat()
        })
        
    # Notifications (global for user)
    notifications = Notification.query.filter_by(user_id=user.id, is_read=False).order_by(Notification.created_at.desc()).limit(5).all()
    notifications_data = []
    for n in notifications:
        notifications_data.append({
            "id": n.id,
            "type": n.type,
            "message": n.message,
            "created_at": n.created_at.isoformat()
        })
        
    # Team members
    members = WorkspaceMember.query.filter_by(workspace_id=workspace.id).limit(5).all()
    team_data = []
    for m in members:
        u = User.query.get(m.user_id)
        if u:
            team_data.append({
                "id": u.id,
                "name": u.full_name,
                "role": m.role
            })

    return jsonify({
        "has_workspace": True,
        "workspace": {
            "id": workspace.id,
            "name": workspace.name,
            "role": role
        },
        "stats": {
            "active_projects": active_projects_count,
            "my_open_tasks": my_open_tasks_count,
            "completed_tasks": completed_tasks_count,
            "overdue_tasks": overdue_tasks_count
        },
        "projects": projects_data,
        "my_tasks": my_tasks_data,
        "upcoming_deadlines": upcoming_data,
        "recent_activity": activities_data,
        "notifications": notifications_data,
        "team_members": team_data
    })


@app.route('/api/projects', methods=['GET'])
def get_projects():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    ws_id = request.args.get('workspace_id')
    workspace, role = get_current_workspace(user.id, ws_id)
    if not workspace: return jsonify({"error": "Workspace not found"}), 404
    
    projects = Project.query.filter_by(workspace_id=workspace.id).all()
    projects_data = []
    for p in projects:
        # progress calculation
        total_tasks = Task.query.filter_by(project_id=p.id).count()
        completed = Task.query.filter_by(project_id=p.id, status='completed').count()
        progress = int((completed / total_tasks * 100)) if total_tasks > 0 else 0
        
        # members
        members = ProjectMember.query.filter_by(project_id=p.id).all()
        members_data = []
        for m in members:
            u = User.query.get(m.user_id)
            if u:
                members_data.append({"id": u.id, "name": u.full_name, "email": u.email})
                
        projects_data.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "status": p.status,
            "start_date": p.start_date.isoformat() if p.start_date else None,
            "deadline": p.deadline.isoformat() if p.deadline else None,
            "progress": progress,
            "total_tasks": total_tasks,
            "completed_tasks": completed,
            "members": members_data,
            "created_at": p.created_at.isoformat(),
            "updated_at": p.created_at.isoformat() # Fake updated_at for now unless we add column
        })
        
    return jsonify({"projects": projects_data}), 200

@app.route('/api/projects', methods=['POST'])
def create_project():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    ws_id = data.get('workspace_id')
    name = data.get('name')
    if not name or not name.strip(): return jsonify({"error": "Project name is required"}), 400
    
    workspace, role = get_current_workspace(user.id, ws_id)
    if not workspace: return jsonify({"error": "Workspace not found"}), 404
    if role not in ['owner', 'admin', 'member']: return jsonify({"error": "Permission denied"}), 403 # Assuming members can create projects too? Or just owner/admin. Let's allow members if authorized.
    
    status = data.get('status', 'Planning')
    if status not in ['Planning', 'Active', 'On Hold', 'Completed', 'Archived']:
        status = 'Planning'
        
    deadline_str = data.get('deadline')
    deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00')) if deadline_str else None
    
    start_date_str = data.get('start_date')
    start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00')) if start_date_str else None
    
    project = Project(
        workspace_id=workspace.id, 
        name=name.strip(), 
        description=data.get('description'),
        status=status,
        start_date=start_date,
        deadline=deadline
    )
    db.session.add(project)
    db.session.commit()
    
    # Add creator as member
    pm = ProjectMember(project_id=project.id, user_id=user.id)
    db.session.add(pm)
    
    # Add other members
    member_ids = data.get('members', [])
    for m_id in member_ids:
        if m_id != user.id:
            # Check if they are in the workspace
            is_ws_member = WorkspaceMember.query.filter_by(workspace_id=workspace.id, user_id=m_id).first()
            if is_ws_member:
                db.session.add(ProjectMember(project_id=project.id, user_id=m_id))
                
    db.session.commit()
    
    log_activity(workspace.id, user.id, 'created a new project', name)
    db.session.commit()
    
    return jsonify({"id": project.id, "name": project.name}), 201

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    project = Project.query.get_or_404(project_id)
    workspace, role = get_current_workspace(user.id, project.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    total_tasks = Task.query.filter_by(project_id=project.id).count()
    completed = Task.query.filter_by(project_id=project.id, status='completed').count()
    progress = int((completed / total_tasks * 100)) if total_tasks > 0 else 0
    
    members = ProjectMember.query.filter_by(project_id=project.id).all()
    members_data = []
    for m in members:
        u = User.query.get(m.user_id)
        if u:
            members_data.append({"id": u.id, "name": u.full_name, "email": u.email})
            
    return jsonify({
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "start_date": project.start_date.isoformat() if project.start_date else None,
        "deadline": project.deadline.isoformat() if project.deadline else None,
        "progress": progress,
        "total_tasks": total_tasks,
        "completed_tasks": completed,
        "members": members_data
    }), 200

@app.route('/api/projects/<int:project_id>', methods=['PUT', 'PATCH'])
def update_project(project_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    project = Project.query.get_or_404(project_id)
    workspace, role = get_current_workspace(user.id, project.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()
    if 'name' in data:
        name = data.get('name').strip()
        if not name: return jsonify({"error": "Project name cannot be empty"}), 400
        project.name = name
    if 'description' in data:
        project.description = data.get('description')
    if 'status' in data:
        status = data.get('status')
        if status in ['Planning', 'Active', 'On Hold', 'Completed', 'Archived']:
            project.status = status
    if 'start_date' in data:
        start_date_str = data.get('start_date')
        project.start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00')) if start_date_str else None
    if 'deadline' in data:
        deadline_str = data.get('deadline')
        project.deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00')) if deadline_str else None
        
    if 'members' in data:
        # Replace members
        ProjectMember.query.filter_by(project_id=project.id).delete()
        member_ids = data.get('members', [])
        # Ensure current user is not removed if desired? Or let them manage freely.
        for m_id in member_ids:
            is_ws_member = WorkspaceMember.query.filter_by(workspace_id=workspace.id, user_id=m_id).first()
            if is_ws_member:
                db.session.add(ProjectMember(project_id=project.id, user_id=m_id))
                
    db.session.commit()
    log_activity(workspace.id, user.id, 'updated project', project.name)
    db.session.commit()
    
    return jsonify({"message": "Project updated"}), 200

@app.route('/api/projects/<int:project_id>/archive', methods=['POST'])
def archive_project(project_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    project = Project.query.get_or_404(project_id)
    workspace, role = get_current_workspace(user.id, project.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    project.status = 'Archived'
    db.session.commit()
    
    log_activity(workspace.id, user.id, 'archived project', project.name)
    db.session.commit()
    
    return jsonify({"message": "Project archived"}), 200

@app.route('/api/tasks', methods=['POST'])
def create_task():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    ws_id = data.get('workspace_id')
    
    workspace, role = get_current_workspace(user.id, ws_id)
    if not workspace: return jsonify({"error": "Workspace not found"}), 404
    
    title = data.get('title')
    project_id = data.get('project_id')
    due_date_str = data.get('due_date')
    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')) if due_date_str else None
    priority = data.get('priority', 'Medium')
    
    task = Task(
        workspace_id=workspace.id, 
        title=title, 
        project_id=project_id,
        assignee_id=user.id, # Auto assign to self for testing
        due_date=due_date,
        priority=priority
    )
    db.session.add(task)
    db.session.commit()
    
    log_activity(workspace.id, user.id, 'created a task', title)
    db.session.commit()
    
    return jsonify({"id": task.id, "title": task.title}), 201

@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
def complete_task(task_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    task = Task.query.get_or_404(task_id)
    workspace, _ = get_current_workspace(user.id, task.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    task.status = 'completed'
    log_activity(workspace.id, user.id, 'completed a task', task.title)
    db.session.commit()
    
    return jsonify({"message": "Task completed"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
