"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  link: string;
  roles: string[];
  exact?: boolean;
  children?: MenuItem[];
}

interface ScrollableTabsProps {
  tabs: MenuItem[];
  activeTab: string;
  onChange: (tab: MenuItem, index: number) => void;
}

export default function ScrollableTabs({
  tabs,
  activeTab,
  onChange,
}: ScrollableTabsProps) {
  const [internalActive, setInternalActive] = useState(activeTab);
  const [expandedTab, setExpandedTab] = useState<string | null>(null);
  const [childTabs, setChildTabs] = useState<MenuItem[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const childContainerRef = useRef<HTMLDivElement>(null);

  // Sync internal active state with prop changes
  useEffect(() => {
    setInternalActive(activeTab);
  }, [activeTab]);

  // Set active tab based on current route
  useEffect(() => {
    if (tabs.length > 0) {
      const currentTab = tabs.find(
        (tab) => pathname === tab.link || pathname.startsWith(tab.link + "/")
      );

      if (currentTab && currentTab.text !== internalActive) {
        setInternalActive(currentTab.text);
        onChange(currentTab, tabs.indexOf(currentTab));
      } else if (
        !currentTab &&
        tabs.length > 0 &&
        internalActive !== tabs[0].text
      ) {
        setInternalActive(tabs[0].text);
        onChange(tabs[0], 0);
      }
    }
  }, [pathname, tabs, internalActive, onChange]);

  // Check if a tab has children
  const hasChildren = (tab: MenuItem) => {
    return tab.children && tab.children.length > 0;
  };

  // Handle tab click
  const handleTabClick = (
    tab: MenuItem,
    index: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    
    if (hasChildren(tab)) {
      // Toggle expanded state
      if (expandedTab === tab.text) {
        setExpandedTab(null);
        setChildTabs([]);
      } else {
        setExpandedTab(tab.text);
        setChildTabs(tab.children || []);
      }
    } else {
      setInternalActive(tab.text);
      onChange(tab, index);
      setExpandedTab(null);
      setChildTabs([]);

      if (tab.link && tab.link !== "#") {
        router.push(tab.link);
      }
    }

    // Ensure visibility in scroll container
    if (containerRef.current) {
      const container = containerRef.current;
      const button = e.currentTarget;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      if (
        buttonRect.left < containerRect.left ||
        buttonRect.right > containerRect.right
      ) {
        container.scrollTo({
          left:
            container.scrollLeft +
            (buttonRect.left - containerRect.left) -
            containerRect.width / 2 +
            buttonRect.width / 2,
          behavior: "smooth",
        });
      }
    }
  };

  // Handle child tab click
  const handleChildTabClick = (tab: MenuItem, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setInternalActive(tab.text);
    
    if (tab.link && tab.link !== "#") {
      router.push(tab.link);
    }

    // Ensure visibility in child scroll container
    if (childContainerRef.current) {
      const container = childContainerRef.current;
      const button = e.currentTarget;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      if (
        buttonRect.left < containerRect.left ||
        buttonRect.right > containerRect.right
      ) {
        container.scrollTo({
          left:
            container.scrollLeft +
            (buttonRect.left - containerRect.left) -
            containerRect.width / 2 +
            buttonRect.width / 2,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-start gap-4 relative">
        {/* Main Tabs */}
        <div
          ref={containerRef}
          className="flex flex-wrap pb-2 w-full min-w-0 flex-1"
        >
          <div className="flex space-x-6 flex-wrap">
            {tabs.map((tab, index) => (
              <button
                key={tab.text}
                onClick={(e) => handleTabClick(tab, index, e)}
                className={`relative hover:cursor-pointer flex-shrink-0 pb-1 font-semibold transition-colors text-sm md:text-base flex items-center gap-1 ${
                  internalActive === tab.text
                    ? "text-[#035140]"
                    : "text-gray-500 hover:text-[#023a2d]"
                } ${expandedTab === tab.text ? "text-[#035140]" : ""}`}
              >
                {tab.text}
                
                {internalActive === tab.text && (
                  <motion.div
                    layoutId="underline"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute left-0 -bottom-0.5 h-[2px] w-full bg-[#035140] rounded"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Child Tabs - Appears on the right side */}
        <AnimatePresence>
          {expandedTab && childTabs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 overflow-hidden border-gray-200 absolute md:top-2 top-6 right-2"
            >
              <div
                ref={childContainerRef}
                className="flex overflow-x-auto pb-2 hide-scrollbar scroll-smooth"
              >
                <div className="flex space-x min-w-max">
                  {childTabs.map((tab) => (
                    <motion.button
                      key={tab.text}
                      onClick={(e) => handleChildTabClick(tab, e)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`relative hover:cursor-pointer flex-shrink-0 pb-1 font-medium transition-colors text-xs md:text-sm px-3 py-1 rounded-full ${
                        internalActive === tab.text
                          ? "text-[#035140]"
                          : "text-gray-500 hover:text-[#023a2d]"
                      }`}
                    >
                      {tab.text}
                      {internalActive === tab.text && (
                        <motion.div
                          layoutId="child-underline"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className="absolute left-0 -bottom-0.5 h-[2px] w-full bg-[#035140] rounded"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}