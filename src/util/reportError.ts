import { TextBasedChannel } from "discord.js";
import { Return } from "ebay-api/api/restful/postOrder/index.js";

export default function reportErrorInChannel(channelError: TextBasedChannel, error: Error) {

    if (!error) return console.log('Error reported was null');

    if (error.name == 'EBayAccessDenied')  {
        //Not necessary to report anything. This error ocurrs when the requests limit has been hit, and for that
        //there is already a test request before doing the ebay products search
        return;
    }

    console.log(error.stack)
    
    if (channelError) {
        channelError.send('¡Ha ocurrido un error!')
        channelError.send("```" + error.name + "```")
    }
}