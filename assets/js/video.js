import Player from "./player"

let Video = {
    init( socket, element )
    {
        if ( !element )
        {
            return
        }

        let playerId = element.getAttribute( "data-player-id" )
        let videoId = element.getAttribute( "data-id" )
        socket.connect()
        Player.init(
            element.id,
            playerId,
            () =>
            {
                this.onReady( videoId, socket )
            } )
    },

    onReady( videoId, socket )
    {
        let msgContainer = document.getElementById( "msg-container" )
        let msgInput = document.getElementById( "msg-input" )
        let postButton = document.getElementById( "msg-submit" )
        let videoChannel = socket.channel( "videos:" + videoId )

        // TODO joint the videoChannel
        videoChannel.join()
            .receive( "ok", resp => console.log( "joined the video channel", resp ) )
            .receive( "error", reason => console.log( "join failed", reason ) )

        videoChannel.on( "ping", ( { count } ) => console.log( "PING", count ) )
    }
}

// Create a new channel
let videoChannel = socket.channel( "videos:" + videoId )

// Start listen to click event
postButton.addEventListener( "click", e =>
{
    let payload = { body: msgInput.value, at: Player.getCurrentTime() }
    videoChannel.push( "new_annotation", payload )
        .receive( "error", e => console.log( e ) )
    msgInput.value = ""
} )

// on event "new_annotation trigger by click"
videoChannel.on( "new_annotation", ( resp ) =>
{
    this.renderAnnotation( msgContainer, resp )
} )

videoChannel.join()
    .receive( "ok", resp => console.log( "joined te video channel", resp ) )
    .receive( "error", reason => console.log( "join failed", reason ) )

renderAnnotation( msgContainer, { user, body, at } )
{
    let template = document.createElement( "div" )
    template.innerHTML =
        `<a href="#" 
            data-seek="${ this.esc( at ) }"> 
            <b>${ this.esc( user.username ) }
            </b>:${ this.esc( body ) }
        </a>`

    msgContainer.appendChild( template )
    msgContainer.scrollTop = msgContainers.scrollHeight
}

esc( str )
{
    let div = document.createElement( "div" )
    div.appendChild( document.createTextNode( str ) )
    return div.innerHTML
}

export default Video