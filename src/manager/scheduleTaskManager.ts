import UUID from 'crypto'

let tasks: { id: string , timeOut: NodeJS.Timeout }[] = []

const MINUTE = 1000 * 60
const HOUR = MINUTE * 60
const DAY_TO_MILISECONDS = HOUR * 24

function registerTask(action: () => any, timeTo: string, id?: string) {
    let actionStart = setTimeout(action, getTimeTo(timeTo))
    tasks.push({id: id ? id : UUID.randomUUID(), timeOut:  actionStart})

    return {
        cancell(){
            clearTimeout(actionStart)
        }
    }
}

function cancelTasks(ids: string[]){
    ids.forEach(id => {
        cancelTask(id)
    })
}

function cancelTask(id: string) {
    let index = tasks.findIndex(tasks => tasks.id === id)

    if(index != -1){
        let task = tasks[index]
        clearTimeout(task.timeOut)
        tasks.splice(index, 1)
    }
}

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

export {
    getTimeTo,
    registerTask, 
    cancelTasks,
    DAY_TO_MILISECONDS
}