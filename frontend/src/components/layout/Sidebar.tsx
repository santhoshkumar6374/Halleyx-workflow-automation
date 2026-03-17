import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, List, ActivitySquare, ScrollText } from 'lucide-react';

export function Sidebar() {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/workflows', icon: List, label: 'Workflows' },
    { to: '/workflows/create', icon: FilePlus2, label: 'Create Workflow' },
    { to: '/audit', icon: ScrollText, label: 'Audit Logs' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <ActivitySquare className="h-6 w-6 text-indigo-600 mr-2" />
        <span className="text-xl font-bold text-gray-900">AutoFlow</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
