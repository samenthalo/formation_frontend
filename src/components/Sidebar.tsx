import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  FileText, 
  ClipboardList, 
  Users, 
  Award,
  BookOpen,
  FileQuestion,
  FileOutput,
  Calendar,
  LineChart,
  MessageSquare,
  List,
  UserCircle,
  GraduationCap,
  School,
  Library,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  userRole: 'admin' | 'instructor' | 'trainee';
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const getNavItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
          { path: '/admin/trainees', icon: UserCircle, label: 'Stagiaires' },
          { path: '/admin/formations', icon: GraduationCap, label: 'Sessions' },
          { path: '/admin/instructors', icon: School, label: 'Formateurs' },
          { path: '/admin/calendar', icon: Calendar, label: 'Calendrier' },
          { path: '/admin/attendance', icon: CheckSquare, label: 'Présences' },
          { path: '/admin/quiz-list', icon: List, label: 'Liste des Quiz' },
          { path: '/admin/quiz', icon: BookOpen, label: 'Créer Quiz' },
          { path: '/admin/survey-list', icon: List, label: 'Liste des Questionnaires' },
          { path: '/admin/survey', icon: FileQuestion, label: 'Créer Questionnaire' },
          { path: '/admin/documents', icon: FileOutput, label: 'Documents' },
          { path: '/catalog', icon: Library, label: 'Catalogue' }
        ];
      case 'instructor':
        return [
          { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
          { path: '/instructor/sessions', icon: Calendar, label: 'Sessions' },
          { path: '/instructor/results', icon: LineChart, label: 'Résultats' },
          { path: '/instructor/feedback', icon: MessageSquare, label: 'Feedback' },
          { path: '/catalog', icon: Library, label: 'Catalogue' }
        ];
      case 'trainee':
        return [
          { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
          { path: '/catalog', icon: Library, label: 'Catalogue' },
          { path: '/registration', icon: UserPlus, label: 'Inscription' },
          { path: '/conventions', icon: FileText, label: 'Conventions' },
          { path: '/assessments', icon: ClipboardList, label: 'Évaluations' },
          { path: '/attendance', icon: Users, label: 'Présence' },
          { path: '/certificates', icon: Award, label: 'Attestations' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white shadow-md h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;