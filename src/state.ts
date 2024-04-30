export const globalGameState = {
  scenes: ['level-1', 'level-2', 'win', 'lose'],
  nextScene: '',
  currentScene: 'level-1',
  setCurrentScene(sceneName: string) {
    if (this.scenes.includes(sceneName)) {
      this.currentScene = sceneName;
    }
  },
  setNextScene(sceneName: string) {
    if (this.scenes.includes(sceneName)) {
      this.nextScene = sceneName;
    }
  },
};
