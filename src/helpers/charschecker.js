module.exports = {
    isJapaneseAndChineseChars: (str) => {
        return str.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/);
    }
}