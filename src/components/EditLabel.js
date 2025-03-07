import React from 'react';

function EditLabel({name, editable = false, defaultValue,
                       onChange, keyWidth = 25, value,
                       type = "number", text}) {

    return (
        <div className={"editable-label" + (editable ? " editable" : "")}>
            <div className={"edl-key"} style={{width:`${keyWidth}%`}}>
                <span>{text ?? name}</span>
            </div>
            <div className={"edl-value"}>
                {editable ? (
                    <input type={type} defaultValue={defaultValue}
                           style={{width:`${100 - keyWidth}%`}}
                           value={value}
                           name={name}
                           onChange={(e) => {
                               typeof onChange == 'function' && onChange(e);
                           }}/>
                ) : (
                    <span>{defaultValue}</span>
                )}
            </div>
        </div>
    )
}

export default EditLabel;