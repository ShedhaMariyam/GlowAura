function formattedName(string)
{
    splitted=string.split(" ");
    edited=splitted.map(word=>word.charAt(0).toUpperCase()+word.slice(1).toLowerCase());
    return edited=edited.join(" ");
}

export default formattedName;