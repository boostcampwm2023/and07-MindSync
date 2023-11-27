package boostcamp.and07.mindsync.data.crdt

data class Clock(val id: String, var counter: Int = 0) : Comparable<Clock> {
    fun increment() {
        counter++
    }

    fun merge(remoteClock: Clock): Clock {
        return Clock(id, maxOf(counter, remoteClock.counter))
    }

    override fun compareTo(other: Clock): Int {
        return when {
            this.counter > other.counter -> 1
            this.counter == other.counter -> 0
            else -> -1
        }
    }
}
