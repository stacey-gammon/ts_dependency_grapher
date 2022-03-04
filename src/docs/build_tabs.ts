import { RepoHeaderItem } from './types';

export function buildMdTabs(selectedTab: string, tabs: Array<RepoHeaderItem>): string {
  const header = tabs
    .map((tab) => {
      const isSelected = tab.name === selectedTab;
      const link = `[${tab.name}(${tab.pagePath})]`;
      return isSelected ? `<span>${link}</span>` : link;
    })
    .join(' | ');
  return `| ${header} |`;
}
