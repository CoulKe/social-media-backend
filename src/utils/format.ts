/**Functions for formatting results. */

/**
 * 
 * @param firstUser - sender of the message
 * @param secondUser - receiver of the message
 * @returns chatName
 */
export function createChatName(firstUser: string, secondUser: string) {
  let user1 = firstUser.toString();
  let user2 = secondUser.toString();
  let result = user1 < user2 ? `${user1}@${user2}` : `${user2}@${user1}`;
  return result;
}
/**
 * Creates a snippet of a long value
 * @param text - value to format to short string.
 * @param maxValue - how long the returned text should be- default is 16.
 */
export function createTextSnippet(text: string, maxValue = 16){
    text = text.toString();
    let result = text.length > 16 ? `${text.substring(0, maxValue)}...` : text;
    return result;
}
