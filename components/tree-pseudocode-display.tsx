import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TreePseudocodeDisplayProps {
  operation: string
}

export function TreePseudocodeDisplay({ operation }: TreePseudocodeDisplayProps) {
  const getPseudocode = () => {
    switch (operation) {
      case "insert":
        return [
          "procedure insert(root, value)",
          "    if root is null then",
          "        return new Node(value)",
          "    end if",
          "",
          "    if value < root.value then",
          "        root.left = insert(root.left, value)",
          "    else if value > root.value then",
          "        root.right = insert(root.right, value)",
          "    end if",
          "",
          "    return root",
          "end procedure",
        ]
      case "delete":
        return [
          "procedure delete(root, value)",
          "    if root is null then",
          "        return null",
          "    end if",
          "",
          "    if value < root.value then",
          "        root.left = delete(root.left, value)",
          "    else if value > root.value then",
          "        root.right = delete(root.right, value)",
          "    else",
          "        // Node with only one child or no child",
          "        if root.left is null then",
          "            return root.right",
          "        else if root.right is null then",
          "            return root.left",
          "        end if",
          "",
          "        // Node with two children",
          "        // Get the inorder successor (smallest in right subtree)",
          "        root.value = minValue(root.right)",
          "",
          "        // Delete the inorder successor",
          "        root.right = delete(root.right, root.value)",
          "    end if",
          "",
          "    return root",
          "end procedure",
          "",
          "procedure minValue(node)",
          "    current = node",
          "    while current.left is not null do",
          "        current = current.left",
          "    end while",
          "    return current.value",
          "end procedure",
        ]
      case "search":
        return [
          "procedure search(root, value)",
          "    if root is null or root.value = value then",
          "        return root",
          "    end if",
          "",
          "    if value < root.value then",
          "        return search(root.left, value)",
          "    else",
          "        return search(root.right, value)",
          "    end if",
          "end procedure",
        ]
      case "inorder":
        return [
          "procedure inorderTraversal(root)",
          "    if root is not null then",
          "        inorderTraversal(root.left)",
          "        visit(root)",
          "        inorderTraversal(root.right)",
          "    end if",
          "end procedure",
        ]
      case "preorder":
        return [
          "procedure preorderTraversal(root)",
          "    if root is not null then",
          "        visit(root)",
          "        preorderTraversal(root.left)",
          "        preorderTraversal(root.right)",
          "    end if",
          "end procedure",
        ]
      case "postorder":
        return [
          "procedure postorderTraversal(root)",
          "    if root is not null then",
          "        postorderTraversal(root.left)",
          "        postorderTraversal(root.right)",
          "        visit(root)",
          "    end if",
          "end procedure",
        ]
      default:
        return ["Select an operation to view its pseudocode"]
    }
  }

  const pseudocode = getPseudocode()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pseudocode</CardTitle>
        <CardDescription>Step-by-step algorithm implementation</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code className="text-sm font-mono">
            {pseudocode.map((line, index) => (
              <div key={index} className="whitespace-pre">
                {line}
              </div>
            ))}
          </code>
        </pre>
      </CardContent>
    </Card>
  )
}
