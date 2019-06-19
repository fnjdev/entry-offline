import Sprites from '../resources/db/sprites.json';
import Pictures from '../resources/db/pictures.json';
import Sounds from '../resources/db/sounds.json';
import RendererUtils from './rendererUtils';

interface BaseObject {
    label: { ko: string, en: string, jp?: string, vn?: string };
    category: { main: string, sub: string };
    name: string;
    specials: [];
    created: string;
    _id: string;
}

export interface DBSoundObject extends BaseObject {
    path?: string
    ext: string;
    duration: number;
    filename: string;
}

export interface DBPictureObject extends BaseObject {
    dimension: { height: number, width: number };
    filename: string;
}

export interface DBSpriteObject extends BaseObject {
    pictures: Pick<DBPictureObject, 'label' | 'dimension' | 'filename' | 'name'>[];
    sounds: Pick<DBSoundObject, 'label' | 'duration' | 'ext' | 'filename' | 'name'>[];
}

/**
 * sprite, pictures, sounds 등의 데이터베이스 추출본을 가지고 CRUD 를 흉내내는 클래스.
 *
 */
export default class {
    /**
     * 카테고리에 해당하는 모든 결과를 반환한다.
     * 대분류와 타입은 필수이다. 소분류는 없거나, all 인 경우 전체검색이다.
     * entry-tool 에서 전달받을때 아래의 세개를 전달받는다.
     * @param sidebar 대분류
     * @param subMenu 중분류
     * @param type 테이블명
     * @return {Array<string>} 결과 리스트
     */
    static findAll({ sidebar, subMenu, type }: { sidebar: string, subMenu: string, type: string }) {
        const table = this._selectTable(type);
        return new Promise((resolve) => {
            const findList =
                table.filter((object) => {
                    if (!object.category) {
                        resolve();
                        return;
                    }

                    const { main = '', sub = '' } = object.category;
                    return main === sidebar && (subMenu === 'all' || subMenu === sub);
                })
                    .sort((prev, next) => {
                        if (!next.name || prev.name > next.name) {
                            return 1;
                        } else if (!prev.name || prev.name < next.name) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }) || [];

            resolve(findList);
        });
    }

    /**
     * searchQuery 에 해당하는 키워드를 like 검색한다.
     * 검색은 오브젝트의 name 프로퍼티와만 한다. (운영과 동일)
     * entry-tool 에서 전달받을 때는 아래의 인자를 받게 된다.
     * {category, period, searchQuery, sort, type}
     */
    static search({ type, searchQuery }: { type: string, searchQuery: string }) {
        const table = this._selectTable(type);
        const lowerCaseSearchQuery = searchQuery.toString().toLowerCase();

        return new Promise((resolve) => {
            const findList = table.filter((object) => {
                const { label = {}, name = '' } = object;
                const objectName =
                    label[RendererUtils.getLangType()] ||
                    label[RendererUtils.getFallbackLangType()] ||
                    name;

                return objectName.toString().toLowerCase()
                    .indexOf(lowerCaseSearchQuery) > -1;
            }) || [];

            resolve(findList);
        });
    }

    static _selectTable(type ?: string): DBPictureObject[] | DBSpriteObject[] | DBSoundObject[] | any[] {
        switch (type) {
            case 'picture':
                return Pictures as DBPictureObject[];
            case 'sprite':
                return Sprites as DBSpriteObject[];
            case 'sound':
                return Sounds as DBSoundObject[];
            default:
                return [];
        }
    }
}
