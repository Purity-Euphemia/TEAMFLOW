import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Bell, 
  ShieldCheck, 
  ArrowRight,
  MessageSquare,
  Clock
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="section" style={{ paddingTop: '6rem', paddingBottom: '4rem', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }} className="hero-text">
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.5rem', color: 'hsl(var(--text-primary))' }}>
                Work together. <br/>
                <span className="text-gradient">Get more done.</span>
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'hsl(var(--text-secondary))', marginBottom: '2rem', lineHeight: 1.6 }}>
                Plan projects, manage tasks, collaborate with your team, and keep every deadline on track—all in one simple workspace.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }} className="hero-buttons">
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}>
                  Get Started Free
                </Link>
                <a href="#how-it-works" className="btn btn-secondary" style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}>
                  See How It Works
                </a>
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              {/* Product Preview UI */}
              <div className="glass" style={{ 
                borderRadius: 'var(--radius-xl)', 
                padding: '1.5rem',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid hsl(var(--border-subtle))',
                backgroundColor: 'white'
              }}>
                {/* Header Mock */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Website Redesign Q4</h3>
                    <div style={{ display: 'flex', gap: '1rem', color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> 3 days left</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> 6 members</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    {[1,2,3].map((i) => (
                      <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', background: `hsl(2${i}0 70% 80%)`, border: '2px solid white', marginLeft: i > 1 ? '-8px' : '0' }}></div>
                    ))}
                  </div>
                </div>
                {/* Board Mock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'hsl(var(--bg-primary))', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', marginBottom: '1rem', textTransform: 'uppercase' }}>In Progress (2)</div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', boxShadow: 'var(--shadow-sm)', border: '1px solid hsl(var(--border-subtle))' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Homepage Wireframes</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'hsl(38 92% 90%)', color: 'hsl(38 92% 40%)', borderRadius: '4px', fontWeight: 600 }}>Medium</span>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'hsl(210 70% 80%)' }}></div>
                      </div>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid hsl(var(--border-subtle))' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Copywriting</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'hsl(348 83% 90%)', color: 'hsl(348 83% 40%)', borderRadius: '4px', fontWeight: 600 }}>High</span>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'hsl(250 70% 80%)' }}></div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'hsl(var(--bg-primary))', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', marginBottom: '1rem', textTransform: 'uppercase' }}>Done (1)</div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', opacity: 0.7, border: '1px solid hsl(var(--border-subtle))' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', textDecoration: 'line-through', color: 'hsl(var(--text-secondary))' }}>Brand Guidelines</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'hsl(142 71% 90%)', color: 'hsl(142 71% 40%)', borderRadius: '4px', fontWeight: 600 }}>Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '120%', height: '120%', background: 'radial-gradient(circle, hsla(var(--accent-primary), 0.1) 0%, transparent 70%)',
                zIndex: -1, pointerEvents: 'none'
              }}></div>
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 992px) {
            .hero-grid { grid-template-columns: 1fr 1fr !important; }
            .hero-text { margin: 0 !important; }
          }
          @media (max-width: 768px) {
            .hero-buttons { flex-direction: column; width: 100%; }
            .hero-buttons .btn { width: 100%; text-align: center; justify-content: center; }
          }
        `}} />
      </section>

      {/* TRUST / VALUE SECTION */}
      <section id="for-teams" className="section" style={{ backgroundColor: 'white', borderTop: '1px solid hsl(var(--border-subtle))', borderBottom: '1px solid hsl(var(--border-subtle))', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>Everything your team needs to keep work moving.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {[
              { icon: <ListTodo className="text-gradient" size={28} />, title: 'Task Management', desc: 'Keep every task organized and assigned.' },
              { icon: <LayoutDashboard className="text-gradient" size={28} />, title: 'Project Visibility', desc: 'See project progress and deadlines at a glance.' },
              { icon: <Users className="text-gradient" size={28} />, title: 'Team Collaboration', desc: 'Keep conversations and work connected.' },
              { icon: <CheckCircle2 className="text-gradient" size={28} />, title: 'Clear Accountability', desc: 'Know who is responsible for every task.' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ display: 'inline-flex', marginBottom: '1rem', padding: '1rem', background: 'hsl(var(--bg-primary))', borderRadius: 'var(--radius-xl)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="section" style={{ backgroundColor: 'hsl(var(--bg-primary))' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Everything in one workspace.</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.125rem' }}>All the tools you need to manage your work, without the clutter.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { icon: <LayoutDashboard size={24} />, title: 'Project Management', desc: 'Organize projects, deadlines, and team members in one centralized place.' },
              { icon: <ListTodo size={24} />, title: 'Task Management', desc: 'Create, assign, prioritize, and track tasks with absolute clarity.' },
              { icon: <CheckCircle2 size={24} />, title: 'Kanban Boards', desc: 'Move work from To Do to Done visually with drag-and-drop boards.' },
              { icon: <MessageSquare size={24} />, title: 'Team Collaboration', desc: 'Work together through contextual comments and activity feeds.' },
              { icon: <Bell size={24} />, title: 'Notifications', desc: 'Stay informed about important updates without being overwhelmed.' },
              { icon: <ShieldCheck size={24} />, title: 'Role-Based Access', desc: 'Control what team members can view, edit, and manage.' },
            ].map((feature, i) => (
              <div key={i} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'white', transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'hsla(var(--accent-primary), 0.1)', color: 'hsl(var(--accent-primary))', marginBottom: '1.5rem' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{feature.title}</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem' }}>How TeamFlow works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', position: 'relative' }}>
            <div className="step-connector" style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '2px', background: 'hsl(var(--border-subtle))', zIndex: 0 }}></div>
            
            {[
              { step: '01', title: 'Create your workspace', desc: 'Set up your workspace and bring your team together.' },
              { step: '02', title: 'Plan and assign work', desc: 'Create projects, break work into tasks, and assign responsibilities.' },
              { step: '03', title: 'Track progress', desc: 'Follow project progress, deadlines, and team activity from one place.' },
            ].map((item, i) => (
              <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center', backgroundColor: 'white' }}>
                <div style={{ 
                  width: '80px', height: '80px', margin: '0 auto 1.5rem auto', 
                  borderRadius: '50%', background: 'white', border: '2px solid hsl(var(--accent-primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--accent-primary))',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '250px', margin: '0 auto' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 768px) {
              .step-connector { display: none; }
            }
          `}} />
        </div>
      </section>

      {/* KANBAN / PRODUCT SHOWCASE */}
      <section className="section" style={{ backgroundColor: 'hsl(var(--bg-primary))', borderTop: '1px solid hsl(var(--border-subtle))', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>See work move forward.</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.125rem' }}>
              From the first task to the final delivery, TeamFlow gives your team a clear view of what needs to happen next.
            </p>
          </div>
          
          <div className="glass" style={{ 
            backgroundColor: 'white', 
            borderRadius: 'var(--radius-xl)', 
            padding: '2rem', 
            overflowX: 'auto',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid hsl(var(--border-subtle))'
          }}>
            <div style={{ display: 'flex', gap: '1.5rem', minWidth: '800px' }}>
              {[
                { name: 'TO DO', count: 2, color: 'hsl(215 16% 47%)', tasks: ['Design landing page', 'Create database schema'] },
                { name: 'IN PROGRESS', count: 2, color: 'hsl(235 85% 60%)', tasks: ['Build authentication', 'Create dashboard'] },
                { name: 'REVIEW', count: 1, color: 'hsl(38 92% 50%)', tasks: ['Test project API'] },
                { name: 'DONE', count: 2, color: 'hsl(142 71% 45%)', tasks: ['Set up repository', 'Create project'] },
              ].map((col, i) => (
                <div key={i} style={{ flex: 1, background: 'hsl(var(--bg-primary))', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }}></div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>{col.name}</div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'hsl(var(--border-subtle))', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>{col.count}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {col.tasks.map((task, j) => (
                      <div key={j} style={{ 
                        background: 'white', 
                        padding: '1rem', 
                        borderRadius: 'var(--radius-md)', 
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid hsl(var(--border-subtle))',
                        opacity: col.name === 'DONE' ? 0.7 : 1
                      }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem', textDecoration: col.name === 'DONE' ? 'line-through' : 'none', color: col.name === 'DONE' ? 'hsl(var(--text-secondary))' : 'inherit' }}>{task}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `hsl(${Math.random() * 360} 70% 80%)` }}></div>
                          </div>
                          <MessageSquare size={14} color="hsl(var(--text-muted))" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEAM COLLABORATION SECTION */}
      <section className="section" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div className="collab-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ order: 2 }}>
              <div className="glass" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-lg)', border: '1px solid hsl(var(--border-subtle))' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(210 80% 80%)', flexShrink: 0 }}></div>
                    <div>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>Sarah Jenkins</span> assigned you to <span style={{ fontWeight: 600 }}>Create database schema</span>
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>2 hours ago</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(340 80% 80%)', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>David Chen</span> mentioned you
                      </p>
                      <div style={{ background: 'hsl(var(--bg-primary))', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                        "@user this looks great! Can we push this to production tomorrow?"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ order: 1 }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Keep your team aligned.</h2>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Collaboration happens where the work happens. Tag teammates, leave comments, and get notified about important updates without switching apps.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Contextual task discussions',
                  'Activity feeds and history',
                  '@Mentions and smart notifications',
                  'File attachments and sharing'
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                    <CheckCircle2 color="hsl(var(--success))" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 992px) {
              .collab-grid { grid-template-columns: 1fr 1fr !important; }
              .collab-grid > div:nth-child(1) { order: 1 !important; }
              .collab-grid > div:nth-child(2) { order: 2 !important; }
            }
          `}} />
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="section" style={{ backgroundColor: 'hsl(var(--bg-primary))', borderTop: '1px solid hsl(var(--border-subtle))' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Simple plans for growing teams.</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.125rem' }}>Choose the plan that fits your team's needs.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
            {/* Free */}
            <div className="glass" style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid hsl(var(--border-subtle))', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Free</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '2rem', height: '48px' }}>For individuals and small teams.</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>$0<span style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))', fontWeight: 400 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Up to 5 team members</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> 3 active projects</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Basic task management</li>
              </ul>
              <Link to="/register" className="btn btn-secondary" style={{ width: '100%' }}>Get Started</Link>
            </div>
            {/* Pro */}
            <div className="glass" style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)', border: '2px solid hsl(var(--accent-primary))', boxShadow: 'var(--shadow-xl)', position: 'relative', display: 'flex', flexDirection: 'column', transform: 'scale(1.02)' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'hsl(var(--accent-primary))', color: 'white', padding: '0.25rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pro</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '2rem', height: '48px' }}>For growing teams.</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Coming soon</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Unlimited team members</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Unlimited projects</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Advanced reporting</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Priority support</li>
              </ul>
              <button className="btn btn-primary" style={{ width: '100%', opacity: 0.8 }} disabled>Coming Soon</button>
            </div>
            {/* Business */}
            <div className="glass" style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid hsl(var(--border-subtle))', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Business</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '2rem', height: '48px' }}>For larger organizations.</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Contact us</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Everything in Pro</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Single Sign-On (SSO)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Advanced permissions</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={18} color="hsl(var(--accent-primary))" /> Dedicated success manager</li>
              </ul>
              <a href="#contact" className="btn btn-secondary" style={{ width: '100%' }}>Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section" style={{ backgroundColor: 'hsl(var(--accent-primary))', color: 'white', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white' }}>Ready to bring your team together?</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.9 }}>
            Organize your work, collaborate with your team, and keep every project moving forward.
          </p>
          <Link to="/register" className="btn" style={{ 
            backgroundColor: 'white', 
            color: 'hsl(var(--accent-primary))', 
            padding: '1rem 2rem', 
            fontSize: '1.125rem' 
          }}>
            Get Started Free <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
          </Link>
        </div>
      </section>
    </div>
  );
}
