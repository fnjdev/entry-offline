import IpcRendererHelper from '../ipcRendererHelper';
import StorageManager from '../storageManager';
import RendererUtils from '../rendererUtils';
import Constants from '../constants';
import root from 'window-or-global';

/**
 * 엔트리 코드로직과 관련된 유틸.
 * rendererUtils 와 다른 점은 Entry 관련 코드가 포함되면 이쪽.
 */
export default class {
    static confirmProjectWillDismiss() {
        let confirmProjectDismiss = true;
        if (!Entry.stateManager.isSaved()) {
            confirmProjectDismiss = confirm(RendererUtils.getLang('Menus.save_dismiss'));
        }

        if (confirmProjectDismiss) {
            StorageManager.saveCurrentWorkspaceInterface();
        }

        return confirmProjectDismiss;
    }

    /**
     * 사운드 오브젝트 (from resources/db) 를 Entry.soundQueue 에 로드한다.
     * @param {Array<Object>} sounds
     */
    static loadSound(sounds = []) {
        sounds.forEach((sound) => {
            const path = `${Constants.resourceSoundPath(sound.filename)}${sound.filename}${sound.ext}`;
            Entry.soundQueue.loadFile({
                id: sound._id,
                src: path,
                type: root.createjs.LoadQueue.SOUND,
            });
        });
    }

    static exportObject(object) {
        const { name, script } = object;

        const blockList = script.getBlockList();
        const objectVariable = Entry.variableContainer.getObjectVariables(blockList);
        objectVariable.objects = [object.toJSON()];

        RendererUtils.showSaveDialog({
            defaultPath: name,
            filters: [{ name: 'Entry object file(.eo)', extensions: ['eo'] }],
        }, (filePath) => {
            IpcRendererHelper.exportObject(filePath, objectVariable);
        });
    }
}
