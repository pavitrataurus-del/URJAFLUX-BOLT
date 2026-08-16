
def find_balanced(filename):
    braces = []
    with open(filename) as f:
        for i, line in enumerate(f):
            for char in line:
                if char == '{':
                    braces.append(i+1)
                elif char == '}':
                    if braces:
                        braces.pop()
                        if not braces:
                            print(f'Balanced at line {i+1}')
                            return
                    else:
                        print(f'Unbalanced } at line {i+1}')
                        return
    if braces:
        print(f'Function not balanced, remaining: {braces}')

find_balanced('src/components/SpatialAnnotationEngine.tsx')
