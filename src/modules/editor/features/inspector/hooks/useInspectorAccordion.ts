import { create } from "zustand";
import { persist } from "zustand/middleware";

interface InspectorAccordionStore {
  expanded: Record<string, boolean>;
  setExpanded: (key: string, isOpen: boolean) => void;
  toggleExpanded: (key: string, defaultOpen?: boolean) => void;
}

export const useInspectorAccordionStore = create<InspectorAccordionStore>()(
  persist(
    (set) => ({
      expanded: {},
      setExpanded: (key, isOpen) =>
        set((state) => ({
          expanded: { ...state.expanded, [key]: isOpen },
        })),
      toggleExpanded: (key, defaultOpen = false) =>
        set((state) => {
          const current = state.expanded[key];
          const next = current !== undefined ? !current : !defaultOpen;
          return {
            expanded: { ...state.expanded, [key]: next },
          };
        }),
    }),
    {
      name: "cutnora-inspector-accordion-state",
    }
  )
);

export function useInspectorExpanded(
  key: string,
  defaultOpen = false
): [boolean, () => void, (val: boolean) => void] {
  const isOpen = useInspectorAccordionStore((state) =>
    state.expanded[key] !== undefined ? state.expanded[key] : defaultOpen
  );

  const toggle = () => {
    useInspectorAccordionStore.getState().toggleExpanded(key, defaultOpen);
  };

  const set = (val: boolean) => {
    useInspectorAccordionStore.getState().setExpanded(key, val);
  };

  return [isOpen, toggle, set];
}
