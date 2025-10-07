import { useState } from 'react';

export default function useProjects() {
  const [showParentProjects, setShowParentProjects] = useState(false);
  return {
    projects: [],
  };
}
