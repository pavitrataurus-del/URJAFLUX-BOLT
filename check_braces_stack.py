
stack = []
with open('braces.txt') as f:
    for i, line in enumerate(f):
        char = line.strip()
        if char == '{':
            stack.append(i + 1)
        elif char == '}':
            if stack:
                stack.pop()
            else:
                print(f'Unbalanced closing brace at line {i + 1}')
                break
    else:
        if stack:
            print(f'Unbalanced opening braces at lines: {stack}')
        else:
            print('Balanced')
