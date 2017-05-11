def tupleize(element):
    if isinstance(element, dict):
        new_dict = {}
        for pair in element.items():
            new_dict[pair[0]] = tupleize(pair[1])
        return new_dict
    elif isinstance(element, list):
        return tuple(element)
    else:
        return element
    