module.exports = {
    bytesToSize: (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return 'n/a';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
        if (i === 0) return `${bytes} ${sizes[i]})`;
        return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
    },
    isJapaneseAndChineseChars: (str) => {
        return str.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/);
    },
    milisConverter: (millis) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${(seconds == 60 ? (minutes + 1) : minutes)} ${(minutes > 1) ? "minutes" : "minute"} and ${(seconds < 10 ? "0" : seconds)} ${(seconds > 1 ? "seconds" : "second")}`;
    }
}