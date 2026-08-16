def check_braces(filename):
    braces = []
    with open(filename) as f:
        for i, line in enumerate(f):
            for char in line:
                if char == '{':
                    braces.append(i+1)
                elif char == '}':
                    if braces:
                        braces.pop()
                    else:
                        print(f'Unbalanced }} at line {i+1}')
                        return
    if braces:
        print('Remaining { at lines: ' + str(braces))

check_braces('src/components/SpatialAnnotationEngine.tsx')
