
import React from 'react'
interface IMessage {
    sender: string,
    message: string
}

function Message(props: IMessage) {

    const { sender, message } = props;

    const convertNewlinesToBreaks = (text: string) => {
        return text.split('\n').map((item, index) => (
            <React.Fragment key={index}>
                {convertToBold(item)}
                <br />
            </React.Fragment>
        ));
    }

    const convertToBold = (text: string) => {
        const pattern = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = pattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }
            parts.push(<b key={match.index}>{match[1]}</b>);
            lastIndex = pattern.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts.map((part, index) => (
            <React.Fragment key={index}>{part}</React.Fragment>
        ));
    }

    const toTitleCase = (str: string) => {
        return str?.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    return (
        <div>
            <strong>{toTitleCase(sender)} : </strong> {convertNewlinesToBreaks(message)}
        </div>
    )
}

export default Message;
