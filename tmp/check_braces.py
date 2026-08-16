def check_braces(filename):
    braces_stack = []
    with open(filename) as f:
        for i, line in enumerate(f):
            for char in line:
                if char == '{':
                    braces_stack.append(i + 1)
                elif char == '}':
                    if braces_stack:
                        braces_stack.pop()
                    else:
                        print(f'Unbalanced closing brace at line {i + 1}')
                        return
    if braces_stack:
        print(f'Unbalanced opening braces at lines: {braces_stack}')
    else:
        print('Balanced!')

check_braces('src/components/SpatialAnnotationEngine.tsx')
