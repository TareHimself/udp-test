function testOnAnotherThread() {
    console.log("Inside the function")
    return "WAGWAN"
}

console.log(testOnAnotherThread())

console.log(testOnAnotherThread.toString())

console.log(Function(testOnAnotherThread.toString()).toString())