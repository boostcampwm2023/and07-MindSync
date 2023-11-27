package boostcamp.and07.mindsync

import boostcamp.and07.mindsync.data.crdt.CrdtTree
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

class CrdtTest {
    lateinit var tree1: CrdtTree
    lateinit var tree2: CrdtTree
    @Before
    fun create() {
        tree1 = CrdtTree("1")
        tree2 = CrdtTree("2")
    }

    @Test
    fun operationAdd_otherTime_equal() {
        val op_1_1 = tree1.generateOperationAdd("a", "root", "hello")
        val op_1_2 = tree1.generateOperationAdd("b", "root", "hi")
        val op_2_1 = tree2.generateOperationAdd("c", "root", "good")
        val op_2_2 = tree2.generateOperationAdd("d", "c", "bad")

        tree1.applyOperations(listOf(op_1_1, op_1_2)) // root1 -> a, b
        tree2.applyOperations(listOf(op_2_1, op_2_2)) // root2 -> c -> d

        tree2.applyOperations(listOf(op_1_1, op_1_2))  // root2 -> a, b, c -> d
        tree1.applyOperations(listOf(op_2_1, op_2_2)) // root1 -> a, b, c -> d

        assertEquals(tree1.tree.nodes, tree2.tree.nodes)
    }

    @Test
    fun operationUpdate_otherTime_equal() {
        val op_1_5 = tree1.generateOperationDelete("b")
        val op_2_5 = tree2.generateOperationUpdate("b", "updatedByTree2")
        tree1.applyOperations(listOf(op_1_5))
        tree2.applyOperations(listOf(op_2_5))
        tree2.applyOperations(listOf(op_1_5))
        tree1.applyOperations(listOf(op_2_5))

        assertEquals(tree1.tree.nodes, tree2.tree.nodes)
    }

    @Test
    fun operationDelete_otherTime_equal() {
        val op_1_3 = tree1.generateOperationUpdate("a", "updatedByTree1")
        val op_1_4 = tree1.generateOperationMove("d", "b")
        val op_2_3 = tree2.generateOperationUpdate("a", "updatedByTree2")
        val op_2_4 = tree2.generateOperationMove("a", "c")
        tree1.applyOperations(listOf(op_1_3, op_1_4)) // root1 -> a, c, b-> d
        tree2.applyOperations(listOf(op_2_3, op_2_4)) // root2 -> b, c -> a, d
        tree2.applyOperations(listOf(op_1_3, op_1_4)) // root2 ->  b->  d / c -> a
        tree1.applyOperations(listOf(op_2_3, op_2_4)) // root1 -> c->a / b->d

        assertEquals(tree1.tree.nodes, tree2.tree.nodes)
    }
}