// Returns an array of all the ids
export const getAllIds = messages => messages.map(message => message.messageId)

// Returns true if all messages are selected, false if not
export const getAllSelected = (allIds, selected) => {
    // If there are no ids there's nothing to select
    const noIds = allIds.length === 0

    // If the lengths don't match we're assuming that they're not all selected (assuming no duplicate ids)
    const noLengthMatch = allIds.length !== selected.length

    if (noIds || noLengthMatch) {
        return false
    }

    return allIds.every(id => selected.includes(id))
}
