const messageGen = (username,text) => {

    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const locationGen = (username,latitude,longitude) => {
    return {
        username,
        url: `https://google.com/maps?q=${latitude},${longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    messageGen,locationGen
}


