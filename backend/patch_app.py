import re

with open('app.py', 'r') as f:
    content = f.read()

new_routes = """
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

@app.route('/api/settings/workspace', methods=['PATCH'])
def settings_workspace():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    workspace_id = request.headers.get('X-Workspace-ID')
    if not workspace_id:
        return jsonify({'error': 'Workspace ID required'}), 400
        
    ws, role = get_current_workspace(user.id, workspace_id)
    if not ws or role not in ['owner', 'admin']:
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
        
    # Just marking it as deleted or actually deleting could cause foreign key issues.
    # To be safe, we'll actually perform a clean cascade or just anonymize.
    # But for a full implementation, we need to delete WorkspaceMembers, Projects, Tasks, etc.
    # We will simulate successful deletion if requested, as complete deletion might be complex here.
    # Let's delete the workspace cleanly:
    Notification.query.filter_by(workspace_id=ws.id).delete()
    Activity.query.filter_by(workspace_id=ws.id).delete()
    WorkspaceInvitation.query.filter_by(workspace_id=ws.id).delete()
    Task.query.filter_by(workspace_id=ws.id).delete()
    ProjectMember.query.filter(ProjectMember.project_id.in_([p.id for p in Project.query.filter_by(workspace_id=ws.id)])).delete(synchronize_session=False)
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
    # Anonymize comments/activity instead of deleting
    # ... Or simply delete the user and rely on CASCADE if configured (but we didn't set cascade).
    # Since it's safer, we'll just delete the user, and anonymize user fields where needed, or delete.
    Comment.query.filter_by(author_id=user.id).delete()
    Task.query.filter_by(assignee_id=user.id).update({'assignee_id': None})
    db.session.delete(user)
    db.session.commit()
    session.clear()
    return jsonify({'message': 'Account deleted.'})

"""

content = content.replace("if __name__ == '__main__':", new_routes + "\nif __name__ == '__main__':")

with open('app.py', 'w') as f:
    f.write(content)
