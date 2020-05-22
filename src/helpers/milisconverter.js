module.exports = (millis) => {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${(seconds == 60 ? (minutes + 1) : minutes)} ${(minutes > 1) ? "minutes" : "minute"} and ${(seconds < 10 ? "0" : seconds)} ${(seconds > 1 ? "seconds" : "second")}`;
}