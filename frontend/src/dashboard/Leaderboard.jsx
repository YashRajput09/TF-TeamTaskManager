import React, { useState } from 'react';
import { Trophy, Award, TrendingUp, Clock, Zap } from 'lucide-react';

const Leaderboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  const topThree = [
    { rank: 2, name: 'Sarah Chen', avatar: '👩‍💼', points: 287, color: '#C0C0C0' },
    { rank: 1, name: 'Alex Rivera', avatar: '👨‍💻', points: 342, color: '#FFD700' },
    { rank: 3, name: 'Marcus Johnson', avatar: '👨‍🎨', points: 256, color: '#CD7F32' }
  ];

  const leaderboardData = [
    { rank: 4, name: 'Emily Zhang', avatar: '👩‍🔬', points: 198 },
    { rank: 5, name: 'David Kim', avatar: '👨‍🏫', points: 176 },
    { rank: 6, name: 'Lisa Anderson', avatar: '👩‍⚕️', points: 164 },
    { rank: 7, name: 'James Wilson', avatar: '👨‍💼', points: 142 },
    { rank: 8, name: 'Maya Patel', avatar: '👩‍💻', points: 128 },
    { rank: 9, name: 'Ryan Cooper', avatar: '👨‍🚀', points: 115 },
    { rank: 10, name: 'Sophie Martinez', avatar: '👩‍🎨', points: 98 },
    { rank: 11, name: 'Tom Hughes', avatar: '👨‍🔧', points: 87 },
    { rank: 12, name: 'Nina Gupta', avatar: '👩‍🏫', points: 72 },
    { rank: 13, name: 'Chris Lee', avatar: '👨‍⚖️', points: 45 }
  ];

  const getTrophyLabel = (points) => {
    if (points >= 200) return { emoji: '🥇', label: 'Gold' };
    if (points >= 120) return { emoji: '🥈', label: 'Silver' };
    if (points >= 60) return { emoji: '🥉', label: 'Bronze' };
    return { emoji: '🎗', label: 'Participant' };
  };

  const userStats = {
    currentScore: 142,
    monthlyScore: 1248,
    badges: [
      { name: 'Fast Finisher', icon: '⚡' },
      { name: 'Early Bird', icon: '🌅' },
      { name: 'High Performer', icon: '🎯' }
    ]
  };

  const bgColor = darkMode ? '#1F2937' : '#F5F5F7';
  const cardBg = darkMode ? '#374151' : '#FFFFFF';
  const textPrimary = darkMode ? '#FFFFFF' : '#1D1D1F';
  const textSecondary = darkMode ? '#98989D' : '#86868B';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: bgColor,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      padding: '40px 20px',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <Trophy size={32} color="#007AFF" />
            <h1 style={{ 
              fontSize: '40px', 
              fontWeight: '700', 
              color: textPrimary,
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              Leaderboard
            </h1>
          </div>
          <p style={{ 
            fontSize: '17px', 
            color: textSecondary,
            margin: 0,
            fontWeight: '400'
          }}>
            Top performers based on approved tasks and completion speed
          </p>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: darkMode ? '#4B5563' : '#E5E5EA',
              border: 'none',
              borderRadius: '20px',
              color: textPrimary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          {/* Left Column - Podium and List */}
          <div>
            {/* Top 3 Podium */}
            <div style={{
              backgroundColor: cardBg,
              borderRadius: '20px',
              padding: '48px 32px',
              marginBottom: '24px',
              boxShadow: darkMode 
                ? '0 4px 24px rgba(0, 0, 0, 0.4)' 
                : '0 4px 24px rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(20px)'
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: textPrimary,
                marginBottom: '32px',
                textAlign: 'center'
              }}>
                Top Performers of the Week
              </h2>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                justifyContent: 'center', 
                gap: '16px',
                marginBottom: '16px'
              }}>
                {/* Rank 2 */}
                <div style={{ textAlign: 'center', transform: 'translateY(20px)' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${topThree[0].color}, ${topThree[0].color}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    margin: '0 auto 12px',
                    boxShadow: `0 8px 24px ${topThree[0].color}40`,
                    border: `3px solid ${darkMode ? '#374151' : '#FFFFFF'}`
                  }}>
                    {topThree[0].avatar}
                  </div>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: darkMode ? '#374151' : '#F5F5F7',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px'
                  }}>
                    <div style={{ fontSize: '36px', marginBottom: '4px' }}>🥈</div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: textPrimary
                    }}>2</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: textPrimary, marginTop: '4px' }}>
                      {topThree[0].name}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#007AFF', marginTop: '4px' }}>
                      {topThree[0].points}
                    </div>
                  </div>
                </div>

                {/* Rank 1 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${topThree[1].color}, ${topThree[1].color}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '50px',
                    margin: '0 auto 12px',
                    boxShadow: `0 12px 32px ${topThree[1].color}60`,
                    border: `4px solid ${darkMode ? '#374151' : '#FFFFFF'}`
                  }}>
                    {topThree[1].avatar}
                  </div>
                  <div style={{
                    width: '100px',
                    height: '140px',
                    backgroundColor: darkMode ? '#374151' : '#F5F5F7',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🥇</div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: textPrimary
                    }}>1</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, marginTop: '4px' }}>
                      {topThree[1].name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#007AFF', marginTop: '6px' }}>
                      {topThree[1].points}
                    </div>
                  </div>
                </div>

                {/* Rank 3 */}
                <div style={{ textAlign: 'center', transform: 'translateY(20px)' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${topThree[2].color}, ${topThree[2].color}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    margin: '0 auto 12px',
                    boxShadow: `0 8px 24px ${topThree[2].color}40`,
                    border: `3px solid ${darkMode ? '#2C2C2E' : '#FFFFFF'}`
                  }}>
                    {topThree[2].avatar}
                  </div>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: darkMode ? '#374151' : '#F5F5F7',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px'
                  }}>
                    <div style={{ fontSize: '36px', marginBottom: '4px' }}>🥉</div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: textPrimary
                    }}>3</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: textPrimary, marginTop: '4px' }}>
                      {topThree[2].name}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#007AFF', marginTop: '4px' }}>
                      {topThree[2].points}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Leaderboard List */}
            <div style={{
              backgroundColor: cardBg,
              borderRadius: '20px',
              padding: '24px',
              boxShadow: darkMode 
                ? '0 4px 24px rgba(0, 0, 0, 0.4)' 
                : '0 4px 24px rgba(0, 0, 0, 0.06)'
            }}>
              {leaderboardData.map((user, index) => {
                const trophy = getTrophyLabel(user.points);
                return (
                  <div
                    key={user.rank}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      backgroundColor: darkMode ? '#4B5563' : '#F9F9FB',
                      borderRadius: '16px',
                      marginBottom: index < leaderboardData.length - 1 ? '12px' : 0,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                      border: `1px solid ${darkMode ? '#48484A' : '#E5E5EA'}`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = darkMode 
                        ? '0 8px 16px rgba(0, 0, 0, 0.3)' 
                        : '0 8px 16px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '40px',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: textSecondary,
                      textAlign: 'center'
                    }}>
                      {user.rank}
                    </div>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#007AFF20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      marginRight: '16px'
                    }}>
                      {user.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: textPrimary }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '13px', color: textSecondary, marginTop: '2px' }}>
                        {trophy.emoji} {trophy.label}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#007AFF'
                    }}>
                      {user.points}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Stats Sidebar */}
          <div>
            <div style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #374151 0%, #4B5563 100%)'
                : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
              borderRadius: '20px',
              padding: '32px 24px',
              color: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(0, 122, 255, 0.3)',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Award size={32} style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  Your Performance
                </h3>
                <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>
                  Keep up the great work!
                </p>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>
                    Current Score
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>
                    {userStats.currentScore}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>
                    Monthly Total
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>
                    {userStats.monthlyScore}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', opacity: 0.9 }}>
                  Badges Earned
                </h4>
                {userStats.badges.map((badge, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: index < userStats.badges.length - 1 ? '8px' : 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{badge.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.3)';
              }}
            >
              View My Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;