import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Bell, 
  ShieldCheck, 
  PlayCircle,
  MessageSquare,
  Clock,
  Check,
  FolderKanban,
  Settings
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="section" style={{ paddingTop: '5rem', paddingBottom: '6rem', overflow: 'hidden', backgroundColor: '#F8FAFC', position: 'relative' }}>
        {/* Background abstract shapes */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '40%', height: '80%', background: 'hsl(var(--accent-primary))', opacity: 0.1, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', filter: 'blur(80px)', zIndex: 0 }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
            
            <div style={{ maxWidth: '540px', textAlign: 'left' }} className="hero-text">
              <div style={{ 
                display: 'inline-block', 
                padding: '0.35rem 1rem', 
                backgroundColor: 'hsla(var(--accent-primary), 0.1)', 
                color: 'hsl(var(--accent-primary))', 
                borderRadius: '2rem', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                letterSpacing: '0.05em',
                marginBottom: '1.5rem',
                textTransform: 'uppercase'
              }}>
                Team Collaboration Platform
              </div>
              
              <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', color: 'hsl(var(--text-primary))', letterSpacing: '-0.03em' }}>
                Work together. <br/>
                <span style={{ color: 'hsl(var(--accent-primary))' }}>Get more done.</span>
              </h1>
              
              <p style={{ fontSize: '1.25rem', color: 'hsl(var(--text-secondary))', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                TeamFlow brings your projects, tasks, team communication, and deadlines together in one organized workspace.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }} className="hero-buttons">
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', borderRadius: '0.5rem' }}>
                  Get Started Free
                </Link>
                <a href="#how-it-works" className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid hsl(var(--border-subtle))' }}>
                  <PlayCircle size={20} color="hsl(var(--accent-primary))" /> See How It Works
                </a>
              </div>
            </div>
            
            <div style={{ position: 'relative', perspective: '1000px' }}>
              {/* Product Preview UI - Full Dashboard Mockup */}
              <div className="glass" style={{ 
                borderRadius: '0.75rem', 
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255,255,255,0.8)',
                backgroundColor: 'white',
                transform: 'rotateY(-2deg) rotateX(2deg)',
              }}>
                
                {/* Browser/App Header */}
                <div style={{ background: '#F1F5F9', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
                  </div>
                  <div style={{ flex: 1, background: 'white', height: '24px', borderRadius: '4px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 0.5rem', color: '#94A3B8', fontSize: '0.7rem' }}>
                    teamflow.com/dashboard
                  </div>
                </div>

                <div style={{ display: 'flex', height: '380px' }}>
                  {/* Sidebar */}
                  <div style={{ width: '160px', borderRight: '1px solid #E2E8F0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ width: '24px', height: '24px', background: 'hsl(var(--accent-primary))', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>TF</div>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>TeamFlow</span>
                    </div>
                    {[
                      { icon: <LayoutDashboard size={14} />, name: 'Dashboard', active: true },
                      { icon: <FolderKanban size={14} />, name: 'Projects' },
                      { icon: <ListTodo size={14} />, name: 'Tasks' },
                      { icon: <Users size={14} />, name: 'Team' },
                      { icon: <Bell size={14} />, name: 'Notifications' },
                      { icon: <Settings size={14} />, name: 'Settings' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 500, backgroundColor: item.active ? 'hsla(var(--accent-primary), 0.1)' : 'transparent', color: item.active ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))' }}>
                        {item.icon} {item.name}
                      </div>
                    ))}
                  </div>

                  {/* Main Area */}
                  <div style={{ flex: 1, padding: '1.5rem', background: 'white', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Good morning, Alex 👋</h2>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Here's what's happening with your team today.</p>
                      </div>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsl(210 70% 80%)' }}></div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      {[
                        { label: 'Projects', val: '8', icon: <FolderKanban size={16} color="hsl(235, 85%, 60%)" />, bg: 'hsla(235, 85%, 60%, 0.1)' },
                        { label: 'My Tasks', val: '12', icon: <ListTodo size={16} color="hsl(142, 71%, 45%)" />, bg: 'hsla(142, 71%, 45%, 0.1)' },
                        { label: 'Completed', val: '34', icon: <CheckCircle2 size={16} color="hsl(215, 16%, 47%)" />, bg: 'hsla(215, 16%, 47%, 0.1)' }
                      ].map((stat, i) => (
                        <div key={i} style={{ padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ padding: '0.5rem', borderRadius: '0.375rem', background: stat.bg }}>{stat.icon}</div>
                          <div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{stat.val}</div>
                            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-secondary))' }}>{stat.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Progress & Deadlines */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 600 }}>Project Progress</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {[
                            { name: 'Website Redesign', progress: 75, color: 'hsl(235 85% 60%)' },
                            { name: 'Mobile App', progress: 40, color: 'hsl(38 92% 50%)' },
                            { name: 'Marketing Campaign', progress: 90, color: 'hsl(142 71% 45%)' }
                          ].map((p, i) => (
                            <div key={i} style={{ fontSize: '0.75rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>{p.name}</span>
                                <span style={{ color: 'hsl(var(--text-muted))' }}>{p.progress}%</span>
                              </div>
                              <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${p.progress}%`, height: '100%', background: p.color, borderRadius: '3px' }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 600 }}>Upcoming Deadlines</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {[
                            { name: 'Homepage Design', date: 'Today' },
                            { name: 'API Integration', date: 'Tomorrow' },
                          ].map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '0.375rem', fontSize: '0.7rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? 'hsl(348 83% 47%)' : 'hsl(38 92% 50%)' }}></div>
                                <span>{d.name}</span>
                              </div>
                              <span style={{ color: 'hsl(var(--text-muted))' }}>{d.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 992px) {
            .hero-grid { grid-template-columns: 1fr 1.1fr !important; }
            .hero-text { margin: 0 !important; }
          }
          @media (max-width: 768px) {
            .hero-buttons { flex-direction: column; width: 100%; }
            .hero-buttons .btn { width: 100%; text-align: center; justify-content: center; }
          }
        `}} />
      </section>

      {/* TRUST / VALUE SECTION */}
      <section className="section" style={{ backgroundColor: 'white', padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '700px', margin: '0 auto 4rem auto' }}>
            <h2 style={{ fontSize: '2rem', color: 'hsl(var(--text-primary))', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Everything your team needs to keep work moving.</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.125rem' }}>Stop switching between different tools. Manage your team's work from one place.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem' }}>
            {[
              { icon: <ListTodo size={24} color="white" />, title: 'Task Management', desc: 'Keep every task organized and assigned.' },
              { icon: <LayoutDashboard size={24} color="white" />, title: 'Project Visibility', desc: 'See project progress and deadlines at a glance.' },
              { icon: <Users size={24} color="white" />, title: 'Team Collaboration', desc: 'Keep conversations and work connected.' },
              { icon: <ShieldCheck size={24} color="white" />, title: 'Clear Accountability', desc: 'Know who is responsible for every task.' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  marginBottom: '1.5rem', 
                  padding: '1rem', 
                  background: 'hsl(var(--accent-primary))', 
                  borderRadius: '1rem',
                  boxShadow: '0 10px 15px -3px hsla(var(--accent-primary), 0.3)'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="section" style={{ backgroundColor: '#F8FAFC', padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '0.25rem 0.75rem', 
              color: 'hsl(var(--accent-primary))', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              letterSpacing: '0.05em',
              marginBottom: '1rem',
              textTransform: 'uppercase'
            }}>
              Features
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Everything in one workspace.</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: <LayoutDashboard size={24} />, title: 'Project Management', desc: 'Organize projects, deadlines, and team members.' },
              { icon: <ListTodo size={24} />, title: 'Task Management', desc: 'Create, assign, prioritize, and track tasks.' },
              { icon: <FolderKanban size={24} />, title: 'Kanban Boards', desc: 'Move work from To Do to Done visually.' },
              { icon: <Users size={24} />, title: 'Team Collaboration', desc: 'Work together through comments and activity.' },
              { icon: <Bell size={24} />, title: 'Notifications', desc: 'Stay informed about important updates.' },
              { icon: <ShieldCheck size={24} />, title: 'Role-Based Access', desc: 'Control what team members can manage.' },
            ].map((feature, i) => (
              <div key={i} style={{ 
                padding: '2rem', 
                borderRadius: '1rem', 
                backgroundColor: 'white', 
                border: '1px solid #E2E8F0',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease'
              }}
              className="feature-card"
              >
                <div style={{ 
                  display: 'flex', 
                  padding: '1rem', 
                  borderRadius: '0.75rem', 
                  backgroundColor: 'hsla(var(--accent-primary), 0.1)', 
                  color: 'hsl(var(--accent-primary))',
                  flexShrink: 0
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
                  <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.5, fontSize: '0.95rem' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            .feature-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            @media (max-width: 768px) {
              #features .container > div:last-child { grid-template-columns: 1fr; }
            }
          `}} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section" style={{ backgroundColor: 'white', padding: '6rem 0' }}>
        <div className="container">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
            <div>
              <div style={{ 
                display: 'inline-block', 
                color: 'hsl(var(--accent-primary))', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                textTransform: 'uppercase'
              }}>
                How It Works
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', letterSpacing: '-0.02em' }}>How TeamFlow works</h2>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', position: 'relative' }} className="how-it-works-steps">
                {/* Connector Line */}
                <div className="step-connector" style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '2px', background: 'hsl(var(--border-subtle))', zIndex: 0 }}></div>
                
                {[
                  { step: '01', title: 'Create your workspace', desc: 'Set up your workspace and bring your team together.' },
                  { step: '02', title: 'Plan and assign work', desc: 'Create projects, break work into tasks, and assign responsibilities.' },
                  { step: '03', title: 'Track progress', desc: 'Follow project progress, deadlines, and team activity from one place.' },
                ].map((item, i) => (
                  <div key={i} style={{ position: 'relative', zIndex: 1, backgroundColor: 'white', flex: 1, paddingRight: i !== 2 ? '2rem' : '0' }}>
                    <div style={{ 
                      width: '48px', height: '48px', marginBottom: '1.5rem', 
                      borderRadius: '50%', background: 'hsla(var(--accent-primary), 0.1)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.125rem', fontWeight: 700, color: 'hsl(var(--accent-primary))',
                    }}>
                      {item.step}
                    </div>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>{item.title}</h3>
                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* KANBAN / PRODUCT SHOWCASE */}
            <div className="glass" style={{ 
              backgroundColor: '#F8FAFC', 
              borderRadius: '1rem', 
              padding: '2rem', 
              overflowX: 'auto',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '20px', height: '20px', background: 'hsl(var(--accent-primary))', borderRadius: '4px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>TF</div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>TeamFlow</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', minWidth: '800px' }}>
                {[
                  { name: 'TO DO', color: 'hsl(215 16% 47%)', bg: '#F1F5F9', tasks: ['Design landing page', 'Create database schema'] },
                  { name: 'IN PROGRESS', color: 'hsl(235 85% 60%)', bg: 'hsla(235 85% 60% 0.05)', tasks: ['Build authentication', 'Create dashboard'] },
                  { name: 'REVIEW', color: 'hsl(38 92% 50%)', bg: 'hsla(38 92% 50% 0.05)', tasks: ['Test project API'] },
                  { name: 'DONE', color: 'hsl(142 71% 45%)', bg: 'hsla(142 71% 45% 0.05)', tasks: ['Set up repository', 'Create project'] },
                ].map((col, i) => (
                  <div key={i} style={{ flex: 1, background: 'white', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid', borderColor: col.color }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: col.color, letterSpacing: '0.05em' }}>{col.name}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {col.tasks.map((task, j) => (
                        <div key={j} style={{ 
                          background: 'white', 
                          padding: '1rem', 
                          borderRadius: '0.5rem', 
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                          opacity: col.name === 'DONE' ? 0.7 : 1
                        }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem', color: col.name === 'DONE' ? 'hsl(var(--text-secondary))' : 'inherit' }}>{task}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `hsl(${Math.random() * 360} 70% 80%)`, border: '2px solid white' }}></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'hsl(var(--text-muted))', fontSize: '0.7rem' }}>
                              <MessageSquare size={12} /> 2
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 768px) {
              .step-connector { display: none; }
              .how-it-works-steps { flex-direction: column; gap: 2rem !important; }
              .how-it-works-steps > div { padding-right: 0 !important; }
            }
          `}} />
        </div>
      </section>

      {/* TEAM COLLABORATION SECTION */}
      <section className="section" style={{ backgroundColor: '#F8FAFC', padding: '6rem 0' }}>
        <div className="container">
          <div className="collab-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            
            <div style={{ order: 1 }}>
              <div className="glass" style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Team Activity</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                    <span style={{ color: 'hsl(var(--accent-primary))', fontWeight: 500 }}>All Activity</span>
                    <span>Mentions</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'hsl(210 80% 80%)', flexShrink: 0 }}></div>
                    <div>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>Sarah Jenkins</span> commented on <span style={{ fontWeight: 600, color: 'hsl(var(--accent-primary))' }}>Design landing page</span>
                      </p>
                      <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', border: '1px solid #E2E8F0' }}>
                        "I've updated the hero section mockup, take a look!"
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>2 mins ago</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'hsl(340 80% 80%)', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>David Chen</span> assigned a task to <span style={{ fontWeight: 600, color: 'hsl(var(--accent-primary))' }}>Emma Davis</span>
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ order: 2 }}>
              <div style={{ 
                display: 'inline-block', 
                color: 'hsl(var(--accent-primary))', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                textTransform: 'uppercase'
              }}>
                Collaboration
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Keep your team aligned.</h2>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Comments, notifications, mentions and project updates keep everyone informed and connected.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  'Team members',
                  'Mentions',
                  'Task assignment',
                  'Notifications',
                  'Comments',
                  'Activity feed'
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
                    <div style={{ background: 'hsl(var(--accent-primary))', borderRadius: '50%', padding: '0.15rem' }}>
                      <Check color="white" size={14} strokeWidth={3} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 992px) {
              .collab-grid { grid-template-columns: 1fr !important; }
              .collab-grid > div:nth-child(1) { order: 2 !important; }
              .collab-grid > div:nth-child(2) { order: 1 !important; }
            }
          `}} />
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="section" style={{ backgroundColor: 'white', padding: '6rem 0 8rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ 
              display: 'inline-block', 
              color: 'hsl(var(--accent-primary))', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              letterSpacing: '0.05em',
              marginBottom: '1rem',
              textTransform: 'uppercase'
            }}>
              Pricing
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Ready to bring for growing teams</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            {/* Free */}
            <div className="glass" style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Free</div>
              <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem', fontSize: '0.875rem', height: '40px' }}>For individuals and small teams.</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'baseline' }}>$0<span style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))', fontWeight: 500, marginLeft: '0.25rem' }}>/ month</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', flex: 1, fontSize: '0.95rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> 5 Workspaces</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> 3 Projects</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> Basic Tasks</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> Team members</li>
              </ul>
              <Link to="/register" className="btn btn-secondary" style={{ width: '100%', borderRadius: '0.5rem' }}>Get Started</Link>
            </div>
            {/* Pro */}
            <div className="glass" style={{ backgroundColor: 'white', padding: '3.5rem 2.5rem', borderRadius: '1rem', border: '2px solid hsl(var(--accent-primary))', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'hsl(var(--accent-primary))', color: 'white', padding: '0.25rem 1rem', borderRadius: '2rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>MOST POPULAR</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pro</div>
              <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem', fontSize: '0.875rem', height: '40px' }}>For growing teams.</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'baseline' }}>$12<span style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))', fontWeight: 500, marginLeft: '0.25rem' }}>/ user / month</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', flex: 1, fontSize: '0.95rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> Everything in Free</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> Advanced features</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> More storage</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> Priority support</li>
              </ul>
              <button className="btn btn-primary" style={{ width: '100%', borderRadius: '0.5rem' }}>Start trial</button>
            </div>
            {/* Business */}
            <div className="glass" style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Business</div>
              <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem', fontSize: '0.875rem', height: '40px' }}>For larger organizations.</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'baseline' }}>Custom<span style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))', fontWeight: 500, marginLeft: '0.25rem' }}>/ month</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', flex: 1, fontSize: '0.95rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> Everything in Pro</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> Advanced controls</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> Dedicated support</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Check size={18} color="hsl(var(--accent-primary))" /> SLA & security</li>
              </ul>
              <a href="#contact" className="btn btn-secondary" style={{ width: '100%', borderRadius: '0.5rem' }}>Contact Us</a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA (Footer Top part in Figma) */}
      <section style={{ backgroundColor: '#0B1120', color: 'white', textAlign: 'center', padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-50%', left: '0', width: '100%', height: '100%', background: 'hsl(var(--accent-primary))', opacity: 0.2, borderRadius: '50% 50% 0 0', filter: 'blur(100px)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white', letterSpacing: '-0.02em' }}>Ready to bring your team together?</h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2.5rem', color: '#94A3B8' }}>
            Organize your work, collaborate with your team, and keep every project moving forward.
          </p>
          <Link to="/register" className="btn" style={{ 
            backgroundColor: 'white', 
            color: '#0B1120', 
            padding: '1rem 2.5rem', 
            fontSize: '1rem',
            borderRadius: '0.5rem'
          }}>
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
