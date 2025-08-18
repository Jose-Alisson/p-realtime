const MINUTE = 1000 * 60
const HOUR = MINUTE * 60
const DAY_TO_MILISECONDS = HOUR * 24

function getTimeTo(to: string) {
    let time = new Date()
    let currentyTime = getTimeHoursString(`${time.getHours()}:${time.getMinutes()}`)
    let timeTo = getTimeHoursString(`${to}`)
    return Math.max(0, timeTo - currentyTime)
}

function getTimeHoursString(time: string) {
    const [hours, minutes] = time.split(':').map(t => parseInt(t))
    return HOUR * hours + MINUTE * minutes
}
