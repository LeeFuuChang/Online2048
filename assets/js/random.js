class random {
    static randrange(a, b){
        if( b-a < 0) throw new Error("Empty range for randrange")
        return a + Math.floor(Math.random()*(b-a));
    }

    static choice(arr){
        if(arr.length == 0) throw new Error("Cannot choose from an empty sequence")
        return arr[Math.floor(Math.random()*arr.length)];
    }
}

export { random }