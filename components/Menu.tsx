import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu as MenuIcon } from 'lucide-react';

export interface MenuOption {
  /** Label to display */
  label: string;
  /** Callback when option is clicked */
  onClick: () => void;
}

interface MenuProps {
  /** Array of menu options */
  options: MenuOption[];
  /** Icon and text color for the button/menu items */
  buttonColor?: string;
}

/**
 * A dropdown menu component. Click the hamburger to toggle.
 */
const Menu: React.FC<MenuProps> = ({ options, buttonColor = '#000' }) => {
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => setOpen(prev => !prev);
  const handleOption = (opt: MenuOption) => {
    opt.onClick();
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleToggle}
        aria-label="Open menu"
        className="p-2 rounded-lg hover:bg-black/10 cursor-pointer"
      >
        {/* Use inline style for dynamic color */}
        <MenuIcon color={buttonColor} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/10 z-50"
          >
            <div className="py-1">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOption(opt)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  style={{ color: "#000" }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
