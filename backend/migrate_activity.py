import sqlite3

def migrate_activity():
    conn = sqlite3.connect('/home/gamp/Documents/TeamFlow/backend/teamflow.db')
    c = conn.cursor()
    c.execute('DROP TABLE IF EXISTS activity')
    c.execute('''
    CREATE TABLE activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        actor_id INTEGER NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER,
        project_id INTEGER,
        task_id INTEGER,
        metadata_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(workspace_id) REFERENCES workspace(id),
        FOREIGN KEY(actor_id) REFERENCES user(id),
        FOREIGN KEY(project_id) REFERENCES project(id),
        FOREIGN KEY(task_id) REFERENCES task(id)
    )
    ''')
    conn.commit()
    conn.close()
    print("Migration complete")

if __name__ == '__main__':
    migrate_activity()
