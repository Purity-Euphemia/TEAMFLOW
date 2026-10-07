import os
import secrets
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import re
from datetime import datetime, timezone, timedelta

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
    avatar_url = db.Column(db.String(255), nullable=True)
    timezone = db.Column(db.String(50), default='UTC')
    theme = db.Column(db.String(20), default='system')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login_at = db.Column(db.DateTime, nullable=True)

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
    description = db.Column(db.String(1000), nullable=True)
    priority = db.Column(db.String(20), default='Medium') # Low, Medium, High, Urgent
    status = db.Column(db.String(20), default='To Do') # To Do, In Progress, Review, Done
    due_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    metadata_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'), nullable=True)
    actor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=True)
    
    type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime, nullable=True)

class WorkspaceInvitation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'), nullable=False)
    inviter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='member')
    token = db.Column(db.String(64), unique=True, nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, accepted, canceled
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NotificationPreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    task_assigned = db.Column(db.Boolean, default=True)
    task_status_changed = db.Column(db.Boolean, default=True)
    task_completed = db.Column(db.Boolean, default=True)
    comments = db.Column(db.Boolean, default=True)
    mentions = db.Column(db.Boolean, default=True)
    role_changes = db.Column(db.Boolean, default=True)
    workspace_invitations = db.Column(db.Boolean, default=True)
    activity_updates = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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
    
    if requested_workspace_id and requested_workspace_id != 'undefined':
        try:
            ws_id = int(requested_workspace_id)
            if ws_id in workspace_ids:
                ws = Workspace.query.get(ws_id)
                role = next(m.role for m in memberships if m.workspace_id == ws.id)
                return ws, role
        except ValueError:
            pass
    
    # Default to first workspace
    ws = Workspace.query.get(workspace_ids[0])
    role = next(m.role for m in memberships if m.workspace_id == ws.id)
    return ws, role

import json

def create_activity(workspace_id, actor_id, action_type, entity_type, entity_id=None, project_id=None, task_id=None, metadata=None):
    activity = Activity(
        workspace_id=workspace_id,
        actor_id=actor_id,
        action_type=action_type,
        entity_type=entity_type,
        entity_id=entity_id,
        project_id=project_id,
        task_id=task_id,
        metadata_json=json.dumps(metadata) if metadata else None
    )
    db.session.add(activity)

def create_notification(recipient_id, notif_type, message, workspace_id=None, actor_id=None, task_id=None, project_id=None, comment_id=None, title=None):
    if recipient_id == actor_id:
        return # Avoid self-notifications
    notification = Notification(
        recipient_id=recipient_id,
        type=notif_type,
        message=message,
        workspace_id=workspace_id,
        actor_id=actor_id,
        task_id=task_id,
        project_id=project_id,
        comment_id=comment_id,
        title=title
    )
    db.session.add(notification)

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
        
    ws, role = get_current_workspace(user.id)
    response_data = {"user": {"id": user.id, "full_name": user.full_name, "email": user.email}}
    
    if ws:
        response_data["workspace_id"] = ws.id
        response_data["workspace_name"] = ws.name
        
    return jsonify(response_data), 200


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
    
    create_activity(workspace.id, user.id, 'WORKSPACE_CREATED', 'workspace', workspace.id)
    db.session.commit()
    
    return jsonify({"id": workspace.id, "name": workspace.name}), 201

@app.route('/api/workspaces/members', methods=['GET'])
def get_workspace_members():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    ws_id = request.args.get('workspace_id')
    workspace, role = get_current_workspace(user.id, ws_id)
    if not workspace: return jsonify({"error": "Workspace not found"}), 404
    
    members = WorkspaceMember.query.filter_by(workspace_id=workspace.id).all()
    team_data = []
    for m in members:
        u = User.query.get(m.user_id)
        if u:
            team_data.append({
                "id": u.id,
                "name": u.full_name,
                "email": u.email,
                "role": m.role,
                "joined_at": ""
            })
            
    return jsonify({"members": team_data}), 200

@app.route('/api/workspaces/<int:workspace_id>/invitations', methods=['GET', 'POST'])
def handle_invitations(workspace_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    workspace, role = get_current_workspace(user.id, workspace_id)
    if not workspace or workspace.id != workspace_id:
        return jsonify({"error": "Forbidden"}), 403

    if request.method == 'GET':
        invites = WorkspaceInvitation.query.filter_by(workspace_id=workspace.id, status='pending').all()
        result = []
        for inv in invites:
            inviter = User.query.get(inv.inviter_id)
            result.append({
                "id": inv.id,
                "email": inv.email,
                "role": inv.role,
                "inviter_name": inviter.full_name if inviter else "Unknown",
                "created_at": inv.created_at.isoformat(),
                "expires_at": inv.expires_at.isoformat(),
                "status": inv.status,
                "token": inv.token
            })
        return jsonify({"invitations": result})

    if request.method == 'POST':
        if role not in ['owner', 'admin']:
            return jsonify({"error": "Permission denied"}), 403
            
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        invite_role = data.get('role', 'member').lower()
        
        if not is_valid_email(email):
            return jsonify({"error": "Invalid email"}), 400
        if invite_role not in ['admin', 'member']:
            return jsonify({"error": "Invalid role"}), 400
            
        # Check if already a member
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            existing_member = WorkspaceMember.query.filter_by(workspace_id=workspace.id, user_id=existing_user.id).first()
            if existing_member:
                return jsonify({"error": "User is already a member"}), 400
                
        # Check if pending invite already exists
        existing_invite = WorkspaceInvitation.query.filter_by(workspace_id=workspace.id, email=email, status='pending').first()
        if existing_invite:
            return jsonify({"error": "Invitation already sent"}), 400
            
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        invite = WorkspaceInvitation(
            workspace_id=workspace.id,
            inviter_id=user.id,
            email=email,
            role=invite_role,
            token=token,
            expires_at=expires_at
        )
        db.session.add(invite)
        create_activity(workspace.id, user.id, 'MEMBER_INVITED', 'workspace_member', metadata={'email': email, 'role': invite_role})
        
        if existing_user:
            create_notification(existing_user.id, 'WORKSPACE_INVITATION', f"You were invited to join {workspace.name}", workspace.id, user.id, title="Workspace Invitation")
            
        db.session.commit()
        
        # Here we pretend to send an email or log the token for development
        print(f"DEV MOCK EMAIL: Invite {email} to workspace {workspace.name}. Link: http://localhost:5173/accept-invite?token={token}")
        
        return jsonify({"message": "Invitation created", "token": token}), 201

@app.route('/api/workspaces/<int:workspace_id>/invitations/<int:invite_id>/resend', methods=['POST'])
def resend_invitation(workspace_id, invite_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    workspace, role = get_current_workspace(user.id, workspace_id)
    if not workspace or role not in ['owner', 'admin']:
        return jsonify({"error": "Permission denied"}), 403
        
    invite = WorkspaceInvitation.query.get(invite_id)
    if not invite or invite.workspace_id != workspace.id:
        return jsonify({"error": "Invitation not found"}), 404
        
    if invite.status != 'pending':
        return jsonify({"error": "Invitation is no longer pending"}), 400
        
    # Reset expiration and token
    invite.token = secrets.token_urlsafe(32)
    invite.expires_at = datetime.utcnow() + timedelta(days=7)
    db.session.commit()
    
    print(f"DEV MOCK EMAIL: Resend invite {invite.email} to workspace {workspace.name}. Link: http://localhost:5173/accept-invite?token={invite.token}")
    
    return jsonify({"message": "Invitation resent successfully"}), 200

@app.route('/api/workspaces/<int:workspace_id>/invitations/<int:invite_id>', methods=['DELETE'])
def cancel_invitation(workspace_id, invite_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    workspace, role = get_current_workspace(user.id, workspace_id)
    if not workspace or workspace.id != workspace_id: return jsonify({"error": "Forbidden"}), 403
    if role not in ['owner', 'admin']: return jsonify({"error": "Permission denied"}), 403
    
    invite = WorkspaceInvitation.query.get_or_404(invite_id)
    if invite.workspace_id != workspace.id: return jsonify({"error": "Forbidden"}), 403
    
    invite.status = 'canceled'
    create_activity(workspace.id, user.id, 'MEMBER_INVITE_CANCELED', 'workspace_member', metadata={'email': invite.email})
    db.session.commit()
    return jsonify({"message": "Invitation canceled"})

@app.route('/api/invitations/<token>/accept', methods=['POST'])
def accept_invitation(token):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    invite = WorkspaceInvitation.query.filter_by(token=token, status='pending').first()
    if not invite: return jsonify({"error": "Invalid or expired invitation"}), 404
    
    if invite.expires_at < datetime.utcnow():
        invite.status = 'expired'
        db.session.commit()
        return jsonify({"error": "Invitation expired"}), 400
        
    if user.email != invite.email:
        return jsonify({"error": "This invitation was sent to a different email address"}), 403
        
    existing = WorkspaceMember.query.filter_by(workspace_id=invite.workspace_id, user_id=user.id).first()
    if not existing:
        member = WorkspaceMember(workspace_id=invite.workspace_id, user_id=user.id, role=invite.role)
        db.session.add(member)
        
    invite.status = 'accepted'
    create_activity(invite.workspace_id, user.id, 'MEMBER_JOINED', 'workspace_member')
    db.session.commit()
    
    return jsonify({"message": "Invitation accepted", "workspace_id": invite.workspace_id})

@app.route('/api/workspaces/<int:workspace_id>/members/<int:member_user_id>', methods=['PATCH', 'DELETE'])
def manage_member(workspace_id, member_user_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    workspace, role = get_current_workspace(user.id, workspace_id)
    if not workspace or workspace.id != workspace_id: return jsonify({"error": "Forbidden"}), 403
    if role not in ['owner', 'admin']: return jsonify({"error": "Permission denied"}), 403
    
    target_member = WorkspaceMember.query.filter_by(workspace_id=workspace.id, user_id=member_user_id).first()
    if not target_member: return jsonify({"error": "Member not found"}), 404
    
    target_user = User.query.get(member_user_id)
    
    if request.method == 'PATCH':
        data = request.get_json()
        new_role = data.get('role', '').lower()
        if new_role not in ['admin', 'member']: return jsonify({"error": "Invalid role"}), 400
        
        # Prevent demoting the only owner
        if target_member.role == 'owner': return jsonify({"error": "Cannot change the role of an owner"}), 403
        
        target_member.role = new_role
        create_activity(workspace.id, user.id, 'ROLE_CHANGED', 'workspace_member', target_user.id, metadata={'target_name': target_user.full_name, 'new_role': new_role})
        create_notification(target_user.id, 'ROLE_CHANGED', f"Your {workspace.name} workspace role was changed to {new_role}.", workspace.id, user.id, title="Role Changed")
        db.session.commit()
        return jsonify({"message": "Role updated"})
        
    if request.method == 'DELETE':
        if target_member.role == 'owner':
            return jsonify({"error": "Cannot remove an owner from the workspace"}), 403
        if user.id == member_user_id:
            return jsonify({"error": "Cannot remove yourself. Use leave workspace."}), 400
            
        db.session.delete(target_member)
        create_activity(workspace.id, user.id, 'MEMBER_REMOVED', 'workspace_member', target_user.id, metadata={'target_name': target_user.full_name})
        db.session.commit()
        return jsonify({"message": "Member removed"})

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
    active_projects_count = Project.query.filter(Project.workspace_id == workspace.id, Project.status.in_(['active', 'Active'])).count()
    my_open_tasks_count = Task.query.filter(Task.workspace_id == workspace.id, Task.assignee_id == user.id, Task.status.notin_(['completed', 'Done'])).count()
    completed_tasks_count = Task.query.filter(Task.workspace_id == workspace.id, Task.status.in_(['completed', 'Done'])).count()
    
    now = datetime.utcnow()
    overdue_tasks_count = Task.query.filter(Task.workspace_id == workspace.id, Task.status.notin_(['completed', 'Done']), Task.due_date < now).count()
    
    # Get project progress
    projects = Project.query.filter(Project.workspace_id == workspace.id, Project.status.in_(['active', 'Active'])).all()
    projects_data = []
    for p in projects:
        total_tasks = Task.query.filter_by(project_id=p.id).count()
        completed = Task.query.filter(Task.project_id == p.id, Task.status.in_(['completed', 'Done'])).count()
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
    upcoming = Task.query.filter(Task.workspace_id == workspace.id, Task.status.notin_(['completed', 'Done']), Task.due_date != None).order_by(Task.due_date.asc()).limit(5).all()
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
        actor = User.query.get(a.actor_id)
        
        md = None
        if a.metadata_json:
            import json
            try:
                md = json.loads(a.metadata_json)
            except:
                pass
                
        activities_data.append({
            "id": a.id,
            "actor": {
                "id": actor.id if actor else None,
                "name": actor.full_name if actor else "Unknown"
            },
            "action_type": a.action_type,
            "entity_type": a.entity_type,
            "entity_id": a.entity_id,
            "project_id": a.project_id,
            "task_id": a.task_id,
            "metadata": md,
            "created_at": a.created_at.isoformat() + 'Z'
        })
        
    # Notifications (global for user)
    notifications = Notification.query.filter_by(recipient_id=user.id, is_read=False).order_by(Notification.created_at.desc()).limit(5).all()
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
        completed = Task.query.filter(Task.project_id == p.id, Task.status.in_(['completed', 'Done'])).count()
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
    
    create_activity(workspace.id, user.id, 'PROJECT_CREATED', 'project', project.id, project.id, metadata={'name': name})
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
    completed = Task.query.filter(Task.project_id == project.id, Task.status.in_(['Done', 'completed'])).count()
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
    create_activity(workspace.id, user.id, 'PROJECT_UPDATED', 'project', project.id, project.id, metadata={'name': project.name})
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
    
    create_activity(workspace.id, user.id, 'PROJECT_ARCHIVED', 'project', project.id, project.id, metadata={'name': project.name})
    db.session.commit()
    
    return jsonify({"message": "Project archived"}), 200

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    ws_id = request.args.get('workspace_id')
    project_id = request.args.get('project_id')
    workspace, role = get_current_workspace(user.id, ws_id)
    if not workspace: return jsonify({"error": "Workspace not found"}), 404
    
    query = Task.query.filter_by(workspace_id=workspace.id)
    if project_id:
        # Verify project belongs to workspace
        proj = Project.query.get(project_id)
        if not proj or proj.workspace_id != workspace.id:
            return jsonify({"error": "Invalid project"}), 400
        query = query.filter_by(project_id=project_id)
    else:
        query = query.filter_by(assignee_id=user.id)
        
    tasks = query.all()
    
    tasks_data = []
    for t in tasks:
        proj = Project.query.get(t.project_id) if t.project_id else None
        assignee = User.query.get(t.assignee_id) if t.assignee_id else None
        tasks_data.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "project_name": proj.name if proj else None,
            "project_id": proj.id if proj else None,
            "assignee_name": assignee.full_name if assignee else "Unassigned",
            "priority": t.priority,
            "status": t.status,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "updated_at": t.created_at.isoformat()
        })
        
    return jsonify({"tasks": tasks_data}), 200

@app.route('/api/tasks', methods=['POST'])
def create_task():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    ws_id = data.get('workspace_id')
    
    workspace, role = get_current_workspace(user.id, ws_id)
    if not workspace: return jsonify({"error": "Workspace not found"}), 404
    
    title = data.get('title')
    if not title or not title.strip():
        return jsonify({"error": "Task title is required"}), 400
        
    project_id = data.get('project_id')
    if project_id:
        proj = Project.query.get(project_id)
        if not proj or proj.workspace_id != workspace.id:
            return jsonify({"error": "Invalid project"}), 400
            
    assignee_id = data.get('assignee_id')
    if assignee_id:
        member = WorkspaceMember.query.filter_by(workspace_id=workspace.id, user_id=assignee_id).first()
        if not member:
            return jsonify({"error": "Assignee must be a member of the workspace"}), 400
    else:
        assignee_id = user.id # Default to self if not provided

    status = data.get('status', 'To Do')
    if status not in ['To Do', 'In Progress', 'Review', 'Done', 'todo', 'completed']:
        status = 'To Do'
        
    priority = data.get('priority', 'Medium')
    if priority not in ['Low', 'Medium', 'High', 'Urgent']:
        priority = 'Medium'
        
    due_date_str = data.get('due_date')
    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')) if due_date_str else None
    
    task = Task(
        workspace_id=workspace.id, 
        title=title.strip(), 
        description=data.get('description'),
        project_id=project_id,
        assignee_id=assignee_id,
        due_date=due_date,
        priority=priority,
        status=status
    )
    db.session.add(task)
    db.session.commit()
    
    create_activity(workspace.id, user.id, 'TASK_CREATED', 'task', task.id, project_id, task.id, metadata={'title': title})
    
    if assignee_id and assignee_id != user.id:
        create_notification(assignee_id, 'TASK_ASSIGNED', f"{user.full_name} assigned you a task: {task.title}", workspace.id, user.id, task.id, project_id, title="Task Assigned")
        
    db.session.commit()
    
    return jsonify({"id": task.id, "title": task.title}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'PATCH'])
def update_task(task_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    task = Task.query.get_or_404(task_id)
    workspace, _ = get_current_workspace(user.id, task.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    old_assignee_id = task.assignee_id
    old_status = task.status
    
    data = request.get_json()
    if 'title' in data:
        title = data.get('title').strip()
        if not title: return jsonify({"error": "Title cannot be empty"}), 400
        task.title = title
    if 'description' in data:
        task.description = data.get('description')
    if 'status' in data:
        status = data.get('status')
        if status in ['To Do', 'In Progress', 'Review', 'Done', 'todo', 'completed']:
            task.status = status
    if 'priority' in data:
        priority = data.get('priority')
        if priority in ['Low', 'Medium', 'High', 'Urgent']:
            task.priority = priority
    if 'due_date' in data:
        due_date_str = data.get('due_date')
        task.due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')) if due_date_str else None
    if 'project_id' in data:
        project_id = data.get('project_id')
        if project_id:
            proj = Project.query.get(project_id)
            if not proj or proj.workspace_id != workspace.id:
                return jsonify({"error": "Invalid project"}), 400
            task.project_id = project_id
    if 'assignee_id' in data:
        assignee_id = data.get('assignee_id')
        if assignee_id:
            member = WorkspaceMember.query.filter_by(workspace_id=workspace.id, user_id=assignee_id).first()
            if not member:
                return jsonify({"error": "Assignee must be a member of the workspace"}), 400
            task.assignee_id = assignee_id
            
    db.session.commit()
    create_activity(workspace.id, user.id, 'TASK_UPDATED', 'task', task.id, task.project_id, task.id, metadata={'title': task.title})
    
    if 'assignee_id' in data and task.assignee_id and task.assignee_id != old_assignee_id and task.assignee_id != user.id:
        create_notification(task.assignee_id, 'TASK_ASSIGNED', f"{user.full_name} assigned you a task: {task.title}", workspace.id, user.id, task.id, task.project_id, title="Task Assigned")
        
    if 'status' in data and task.status != old_status and task.assignee_id and task.assignee_id != user.id:
        create_notification(task.assignee_id, 'TASK_STATUS_CHANGED', f"{user.full_name} moved your task to {task.status}", workspace.id, user.id, task.id, task.project_id, title="Task Status Changed")
        
    db.session.commit()
    
    return jsonify({"message": "Task updated"})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    task = Task.query.get_or_404(task_id)
    workspace, role = get_current_workspace(user.id, task.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    # Check permissions, owner or admin can delete, or assignee
    if role not in ['owner', 'admin'] and task.assignee_id != user.id:
        return jsonify({"error": "Permission denied"}), 403
        
    Comment.query.filter_by(task_id=task.id).delete()
    db.session.delete(task)
    create_activity(workspace.id, user.id, 'TASK_DELETED', 'task', None, task.project_id, None, metadata={'title': task.title})
    db.session.commit()
    
    return jsonify({"message": "Task deleted"})

@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
def complete_task(task_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    task = Task.query.get_or_404(task_id)
    workspace, _ = get_current_workspace(user.id, task.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    task.status = 'Done'
    create_activity(workspace.id, user.id, 'TASK_COMPLETED', 'task', task.id, task.project_id, task.id, metadata={'title': task.title})
    
    if task.assignee_id and task.assignee_id != user.id:
        create_notification(task.assignee_id, 'TASK_COMPLETED', f"{user.full_name} completed your task: {task.title}", workspace.id, user.id, task.id, task.project_id, title="Task Completed")
        
    db.session.commit()
    
    return jsonify({"message": "Task completed"})

@app.route('/api/tasks/<int:task_id>/status', methods=['PATCH'])
def update_task_status(task_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    task = Task.query.get_or_404(task_id)
    workspace, _ = get_current_workspace(user.id, task.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()
    status = data.get('status')
    if status not in ['To Do', 'In Progress', 'Review', 'Done']:
        return jsonify({"error": "Invalid status"}), 400
        
    old_status = task.status
    task.status = status
    db.session.commit()
    create_activity(workspace.id, user.id, 'TASK_STATUS_CHANGED', 'task', task.id, task.project_id, task.id, metadata={'title': task.title, 'old_status': old_status, 'new_status': status})
    
    if task.status != old_status and task.assignee_id and task.assignee_id != user.id:
        create_notification(task.assignee_id, 'TASK_STATUS_CHANGED', f"{user.full_name} moved your task to {task.status}", workspace.id, user.id, task.id, task.project_id, title="Task Status Changed")
        
    db.session.commit()
    
    return jsonify({"message": "Task status updated"})

# ==========================================
# COMMENTS
# ==========================================

@app.route('/api/tasks/<int:task_id>/comments', methods=['GET'])
def get_task_comments(task_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    task = Task.query.get_or_404(task_id)
    workspace, _ = get_current_workspace(user.id, task.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = Comment.query.filter_by(task_id=task.id).order_by(Comment.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    comments = pagination.items
    
    # Enrich with author details
    comment_data = []
    for c in comments:
        author = User.query.get(c.author_id)
        comment_data.append({
            "id": c.id,
            "task_id": c.task_id,
            "author_id": c.author_id,
            "author_name": author.full_name if author else 'Unknown User',
            "content": c.content,
            "created_at": c.created_at.isoformat() + 'Z',
            "updated_at": c.updated_at.isoformat() + 'Z'
        })
        
    return jsonify({
        "comments": comment_data,
        "has_more": pagination.has_next,
        "total": pagination.total
    }), 200

@app.route('/api/tasks/<int:task_id>/comments', methods=['POST'])
def create_comment(task_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    task = Task.query.get_or_404(task_id)
    workspace, _ = get_current_workspace(user.id, task.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({"error": "Comment content cannot be empty"}), 400
        
    if len(content) > 5000:
        return jsonify({"error": "Comment content exceeds maximum length"}), 400
        
    comment = Comment(
        task_id=task.id,
        author_id=user.id,
        content=content
    )
    db.session.add(comment)
    db.session.commit()
    
    create_activity(workspace.id, user.id, 'COMMENT_CREATED', 'comment', comment.id, task.project_id, task.id, metadata={'task_title': task.title})
    
    if task.assignee_id and task.assignee_id != user.id:
        create_notification(task.assignee_id, 'TASK_COMMENTED', f"{user.full_name} commented on your task: {task.title}", workspace.id, user.id, task.id, task.project_id, comment.id, title="New Comment")
        
    db.session.commit()
    
    return jsonify({
        "id": comment.id,
        "task_id": comment.task_id,
        "author_id": comment.author_id,
        "author_name": user.full_name,
        "content": comment.content,
        "created_at": comment.created_at.isoformat() + 'Z',
        "updated_at": comment.updated_at.isoformat() + 'Z'
    }), 201

@app.route('/api/comments/<int:comment_id>', methods=['PATCH'])
def edit_comment(comment_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    comment = Comment.query.get_or_404(comment_id)
    
    # Must be the author
    if comment.author_id != user.id:
        return jsonify({"error": "Permission denied"}), 403
        
    task = Task.query.get_or_404(comment.task_id)
    workspace, _ = get_current_workspace(user.id, task.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({"error": "Comment content cannot be empty"}), 400
        
    if len(content) > 5000:
        return jsonify({"error": "Comment content exceeds maximum length"}), 400
        
    comment.content = content
    db.session.commit()
    
    return jsonify({"message": "Comment updated"}), 200

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    comment = Comment.query.get_or_404(comment_id)
    
    # Must be the author
    if comment.author_id != user.id:
        return jsonify({"error": "Permission denied"}), 403
        
    task = Task.query.get_or_404(comment.task_id)
    workspace, _ = get_current_workspace(user.id, task.workspace_id)
    if not workspace: return jsonify({"error": "Forbidden"}), 403
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({"message": "Comment deleted"}), 200


# ==========================================
# NOTIFICATIONS
# ==========================================

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = Notification.query.filter_by(recipient_id=user.id).order_by(Notification.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    notifs = []
    for n in pagination.items:
        notifs.append({
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() + 'Z',
            "read_at": n.read_at.isoformat() + 'Z' if n.read_at else None,
            "workspace_id": n.workspace_id,
            "project_id": n.project_id,
            "task_id": n.task_id
        })
        
    return jsonify({
        "notifications": notifs,
        "has_more": pagination.has_next,
        "total": pagination.total
    }), 200

@app.route('/api/notifications/unread-count', methods=['GET'])
def get_unread_count():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    count = Notification.query.filter_by(recipient_id=user.id, is_read=False).count()
    return jsonify({"unread_count": count}), 200

@app.route('/api/notifications/<int:notif_id>/read', methods=['PATCH'])
def mark_notification_read(notif_id):
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    notif = Notification.query.get_or_404(notif_id)
    if notif.recipient_id != user.id:
        return jsonify({"error": "Permission denied"}), 403
        
    notif.is_read = True
    notif.read_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({"message": "Notification marked as read"}), 200

@app.route('/api/notifications/read-all', methods=['PATCH'])
def mark_all_notifications_read():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    Notification.query.filter_by(recipient_id=user.id, is_read=False).update(
        {"is_read": True, "read_at": datetime.utcnow()}
    )
    db.session.commit()
    
    return jsonify({"message": "All notifications marked as read"}), 200

# ==========================================
# ACTIVITY FEED
# ==========================================

@app.route('/api/activity', methods=['GET'])
def get_activity():
    user = require_auth()
    if not user: return jsonify({"error": "Unauthorized"}), 401
    
    workspace_id = request.args.get('workspace_id', type=int)
    if not workspace_id:
        workspace, _ = get_current_workspace(user.id)
        if not workspace: return jsonify({"error": "Forbidden"}), 403
        workspace_id = workspace.id
    else:
        workspace, _ = get_current_workspace(user.id, workspace_id)
        if not workspace: return jsonify({"error": "Forbidden"}), 403
        
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 20, type=int)
    
    pagination = Activity.query.filter_by(workspace_id=workspace_id).order_by(Activity.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    activities_data = []
    
    for a in pagination.items:
        actor = User.query.get(a.actor_id)
        
        md = None
        if a.metadata_json:
            import json
            try:
                md = json.loads(a.metadata_json)
            except:
                pass
                
        activities_data.append({
            "id": a.id,
            "actor": {
                "id": actor.id if actor else None,
                "name": actor.full_name if actor else "Unknown"
            },
            "action_type": a.action_type,
            "entity_type": a.entity_type,
            "entity_id": a.entity_id,
            "project_id": a.project_id,
            "task_id": a.task_id,
            "metadata": md,
            "created_at": a.created_at.isoformat() + 'Z'
        })
        
    return jsonify({
        "activities": activities_data,
        "pagination": {
            "page": pagination.page,
            "limit": pagination.per_page,
            "total": pagination.total,
            "has_more": pagination.has_next
        }
    }), 200

# =======================================================
# SETTINGS API ROUTES
# =======================================================

@app.route('/api/settings/profile', methods=['GET', 'PATCH'])
def settings_profile():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'GET':
        return jsonify({
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'avatar_url': user.avatar_url,
            'timezone': user.timezone,
            'theme': user.theme
        }), 200
        
    data = request.json
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
        
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'})

@app.route('/api/settings/password', methods=['PATCH'])
def settings_password():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Missing passwords'}), 400
        
    if not check_password_hash(user.password_hash, current_password):
        return jsonify({'error': 'Incorrect current password'}), 400
        
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({'message': 'Password changed successfully'})

@app.route('/api/settings/notifications', methods=['GET', 'PATCH'])
def settings_notifications():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    pref = NotificationPreference.query.filter_by(user_id=user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=user.id)
        db.session.add(pref)
        db.session.commit()
        
    if request.method == 'GET':
        return jsonify({
            'task_assigned': pref.task_assigned,
            'task_status_changed': pref.task_status_changed,
            'task_completed': pref.task_completed,
            'comments': pref.comments,
            'mentions': pref.mentions,
            'role_changes': pref.role_changes,
            'workspace_invitations': pref.workspace_invitations,
            'activity_updates': pref.activity_updates
        }), 200
        
    data = request.json
    fields = ['task_assigned', 'task_status_changed', 'task_completed', 'comments', 'mentions', 'role_changes', 'workspace_invitations', 'activity_updates']
    for field in fields:
        if field in data:
            setattr(pref, field, bool(data[field]))
            
    db.session.commit()
    return jsonify({'message': 'Notification preferences updated'})

@app.route('/api/settings/appearance', methods=['PATCH'])
def settings_appearance():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    if 'theme' in data:
        user.theme = data['theme']
        
    db.session.commit()
    return jsonify({'message': 'Appearance updated'})

@app.route('/api/settings/workspace', methods=['GET', 'PATCH'])
def settings_workspace():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    workspace_id = request.headers.get('X-Workspace-ID')
    if not workspace_id:
        return jsonify({'error': 'Workspace ID required'}), 400
        
    ws, role = get_current_workspace(user.id, workspace_id)
    if not ws:
        return jsonify({'error': 'Forbidden'}), 403
        
    if request.method == 'GET':
        return jsonify({
            'id': ws.id,
            'name': ws.name,
            'role': role
        }), 200
        
    if role not in ['owner', 'admin']:
        return jsonify({'error': 'Forbidden'}), 403
        
    data = request.json
    if 'name' in data and data['name'].strip():
        ws.name = data['name'].strip()
        
    db.session.commit()
    return jsonify({'message': 'Workspace updated successfully'})

@app.route('/api/settings/workspace', methods=['DELETE'])
def settings_delete_workspace():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    workspace_id = request.headers.get('X-Workspace-ID')
    if not workspace_id:
        return jsonify({'error': 'Workspace ID required'}), 400
        
    ws, role = get_current_workspace(user.id, workspace_id)
    if not ws or role != 'owner':
        return jsonify({'error': 'Forbidden. Only the owner can delete a workspace.'}), 403
        
    # Check confirmation name
    data = request.json
    if not data or data.get('confirmation') != ws.name:
        return jsonify({'error': 'Confirmation name does not match.'}), 400
        
    # Delete cascade
    Notification.query.filter_by(workspace_id=ws.id).delete()
    Activity.query.filter_by(workspace_id=ws.id).delete()
    WorkspaceInvitation.query.filter_by(workspace_id=ws.id).delete()
    
    # Task comments need to be deleted
    task_ids = [t.id for t in Task.query.filter_by(workspace_id=ws.id)]
    if task_ids:
        Comment.query.filter(Comment.task_id.in_(task_ids)).delete(synchronize_session=False)
        
    Task.query.filter_by(workspace_id=ws.id).delete()
    
    project_ids = [p.id for p in Project.query.filter_by(workspace_id=ws.id)]
    if project_ids:
        ProjectMember.query.filter(ProjectMember.project_id.in_(project_ids)).delete(synchronize_session=False)
        
    Project.query.filter_by(workspace_id=ws.id).delete()
    WorkspaceMember.query.filter_by(workspace_id=ws.id).delete()
    
    db.session.delete(ws)
    db.session.commit()
    
    return jsonify({'message': 'Workspace deleted permanently.'})

@app.route('/api/settings/account', methods=['DELETE'])
def settings_delete_account():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    # Prevent deletion if owner of any workspace (must transfer ownership first)
    owned_workspaces = WorkspaceMember.query.filter_by(user_id=user.id, role='owner').first()
    if owned_workspaces:
        return jsonify({'error': 'Cannot delete account while you are the owner of a workspace. Delete or transfer ownership first.'}), 400
        
    NotificationPreference.query.filter_by(user_id=user.id).delete()
    WorkspaceMember.query.filter_by(user_id=user.id).delete()
    ProjectMember.query.filter_by(user_id=user.id).delete()
    
    # Anonymize comments
    Comment.query.filter_by(author_id=user.id).delete()
    # Unassign tasks
    Task.query.filter_by(assignee_id=user.id).update({'assignee_id': None})
    
    db.session.delete(user)
    db.session.commit()
    session.clear()
    return jsonify({'message': 'Account deleted.'})

@app.route('/api/search', methods=['GET'])
def global_search():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    query = request.args.get('q', '').strip()
    if len(query) < 2:
        return jsonify({'error': 'Query too short'}), 400
    if len(query) > 100:
        query = query[:100]

    search_type = request.args.get('type', 'all')
    workspace_id = request.args.get('workspace_id')
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))
    except ValueError:
        page = 1
        limit = 5
    
    if limit > 50:
        limit = 50

    ws, _ = get_current_workspace(user.id, workspace_id)
    if not ws:
        return jsonify({'error': 'Workspace not found or access denied'}), 403

    results = {
        'projects': [],
        'tasks': [],
        'people': []
    }
    
    from sqlalchemy import or_

    search_term = f"%{query}%"

    if search_type in ('all', 'projects'):
        project_query = Project.query.filter_by(workspace_id=ws.id).filter(
            or_(Project.name.ilike(search_term), Project.description.ilike(search_term))
        ).limit(limit).all()
        for p in project_query:
            results['projects'].append({
                'id': p.id,
                'name': p.name,
                'description': p.description[:100] + '...' if p.description and len(p.description) > 100 else p.description,
                'status': p.status
            })

    if search_type in ('all', 'tasks'):
        task_query = db.session.query(Task, Project.name, User.full_name).outerjoin(
            Project, Task.project_id == Project.id
        ).outerjoin(
            User, Task.assignee_id == User.id
        ).filter(
            Task.workspace_id == ws.id
        ).filter(
            or_(Task.title.ilike(search_term), Task.description.ilike(search_term))
        ).limit(limit).all()
        
        for t, p_name, u_name in task_query:
            results['tasks'].append({
                'id': t.id,
                'title': t.title,
                'project_id': t.project_id,
                'project_name': p_name,
                'status': t.status,
                'priority': t.priority,
                'assignee_name': u_name
            })

    if search_type in ('all', 'people'):
        member_query = db.session.query(WorkspaceMember, User).join(
            User, WorkspaceMember.user_id == User.id
        ).filter(
            WorkspaceMember.workspace_id == ws.id
        ).filter(
            or_(User.full_name.ilike(search_term), User.email.ilike(search_term))
        ).limit(limit).all()
        
        for m, u in member_query:
            results['people'].append({
                'id': u.id,
                'name': u.full_name,
                'email': u.email,
                'role': m.role,
                'avatar': u.avatar_url
            })

    return jsonify(results), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
