class _Node {
    constructor(value, next) {
        this.value = value;
        this.next = next;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }

    insertFirst(item) {
        this.head = new _Node(item, this.head);
    }

    insertLast(item) {
        if (this.head === null) {
            this.insertFirst(item);
        } else {
            let tempNode = this.head;
            //moving the temp "node" across the list
            while (tempNode.next !== null) {
                tempNode = tempNode.next;
            }
            //appending the actual node to the end of the list linking to null
            tempNode.next = new _Node(item, null);
        }
    }

    insertBefore(item, before) {
        if (!this.find(before)) {
            return;
        } else {
            let tempNode = this.head;
            while (tempNode.next.value !== before) {
                tempNode = tempNode.next;
            }
            let insert = new _Node(item, tempNode.next);
            tempNode.next = insert;
        }
    }

    insertAfter(item, after) {
        if (!this.find(after)) {
            return;
        } else {
            let tempNode = this.head;
            while (tempNode.value !== after) {
                tempNode = tempNode.next;
            }
            let insert = new _Node(item, tempNode.next);
            tempNode.next = insert;
        }
    }

    insertAt(item, at) {
        if (at === 1) {
            this.insertFirst(item);
            return;
        }

        let count = 1;
        let tempNode = this.head;
        while (count < at - 1 || tempNode.next !== null) {
            tempNode = tempNode.next;
            count++;
        }
        let insert = new _Node(item, tempNode.next);
        tempNode.next = insert;
    }

    find(item) {
        //start at the head
        let currentNode = this.head;

        //If the list is empty
        if (!this.head) {
            return null;
        }

        //Move down the list
        while (currentNode.value !== item) {
            //If we're at the end
            if (currentNode.next === null) {
                return null;
            } else {
                //Move one down
                currentNode = currentNode.next;
            }
        }

        //We found it
        return currentNode;
    }

    remove(item) {
        //Empty
        if (!this.head) {
            return null;
        }

        //If the item to be removed is the first item
        if (this.head.value === item) {
            this.head = this.head.next;
            return;
        }

        //Start at the head and move down the list, keeping track of the previous 
        //value for linking reasons
        let currentNode = this.head;
        let previousNode = this.head;

        while ((currentNode !== null) && (currentNode.value !== item)) {
            previousNode = currentNode;
            currentNode = currentNode.next;
        }
        if (currentNode === null) {
            console.log('item not found');
            return;
        }

        previousNode.next = currentNode.next;
    }
}

module.exports = LinkedList;