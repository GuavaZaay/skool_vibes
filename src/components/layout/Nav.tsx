
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Activity } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export default function Nav() {
  const { state } = useApp();
  const location = useLocation();

  const isLiveGame = location.pathname.includes('/live');
  if (isLiveGame) return null;

  const activeGame = state.activeGameId
    ? state.games.find((g) => g.id === state.activeGameId)
    : null;

  const tabs = [
    {
      to: '/',
      label: 'Home',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: '/teams',
      label: 'Teams',
      icon: Users,
      exact: false,
    },
    {
      to: activeGame ? `/game/${activeGame.id}/live` : '/game/setup',
      label: 'Game',
      icon: Activity,
      exact: false,
      badge: activeGame?.status === 'live',
    },
  ];

  return (
    <nav className="tab-bar">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to) && tab.to !== '/';

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 btn-press"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={isActive ? 'text-ios-blue' : 'text-ios-gray'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {tab.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-ios-green block" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${isActive ? 'text-ios-blue' : 'text-ios-gray'}`}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
