import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GanttChart,
  Plus,
  Trash2,
  Save,
  Play,
  AlertCircle,
  Loader2,
  Calculator,
  Table,
  X,
  ChevronRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";



interface Condition {
  id: number;
  column: string;
  operator: string;
  value: string;
}

interface Action {
  id: number;
  type: string;
  target: string;
  value: string;
}

interface Column {
  name: string;
  type: string;
}

interface EquationItem {
  id: string;
  type: "column" | "operator" | "function" | "number";
  value: string;
  display: string;
}



const CreateRules = () => {
  const { toast } = useToast();
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([
    { id: 1, column: "", operator: "equals", value: "" },
  ]);
  const [actions, setActions] = useState<Action[]>([
    { id: 1, type: "set_value", target: "", value: "" },
  ]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Math Equation Builder
  const [equationItems, setEquationItems] = useState<EquationItem[]>([]);
  const [customNumber, setCustomNumber] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  
  const mathOperators = [
    { value: "+", display: "+" },
    { value: "-", display: "-" },
    { value: "*", display: "×" },
    { value: "/", display: "÷" },
    { value: "%", display: "%" },
    { value: "**", display: "^" },
    { value: "(", display: "(" },
    { value: ")", display: ")" },
  ];
  
  const mathFunctions = [
    { value: "ROUND", display: "ROUND" },
    { value: "ABS", display: "ABS" },
    { value: "MAX", display: "MAX" },
    { value: "MIN", display: "MIN" },
    { value: "SUM", display: "SUM" },
    { value: "AVG", display: "AVG" },
    { value: "SQRT", display: "SQRT" },
    { value: "LOG", display: "LOG" },
  ];

  // Dummy data for columns
  const dummyColumns = [
    { name: "revenue", type: "number" },
    { name: "cost", type: "number" },
    { name: "quantity", type: "number" },
    { name: "price", type: "number" },
    { name: "tax_rate", type: "number" },
    { name: "discount", type: "number" },
    { name: "customer_id", type: "string" },
    { name: "product_id", type: "string" },
    { name: "date", type: "date" },
  ];

  useEffect(() => {
    const fetchColumns = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8000/get-columns/flight_data"); // replace with your actual table
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data)
        setColumns(data);
      } catch (error) {
        console.error("Failed to fetch columns:", error);
        toast({
          title: "Error",
          description: "Failed to load columns. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchColumns();
  }, [toast]);

  // Add column to equation
  const addColumnToEquation = (columnName: string) => {
    const newItem: EquationItem = {
      id: generateId(),
      type: "column",
      value: columnName,
      display: columnName,
    };
    setEquationItems([...equationItems, newItem]);
  };

  // Add operator to equation
  const addOperatorToEquation = (operator: { value: string, display: string }) => {
    const newItem: EquationItem = {
      id: generateId(),
      type: "operator",
      value: operator.value,
      display: operator.display,
    };
    setEquationItems([...equationItems, newItem]);
  };

  // Add function to equation
  const addFunctionToEquation = (func: { value: string, display: string }) => {
    const newItem: EquationItem = {
      id: generateId(),
      type: "function",
      value: func.value,
      display: `${func.display}()`,
    };
    setEquationItems([...equationItems, newItem]);
  };

  // Add number to equation
  const addNumberToEquation = () => {
    if (customNumber.trim() === "") return;
    
    const newItem: EquationItem = {
      id: generateId(),
      type: "number",
      value: customNumber,
      display: customNumber,
    };
    setEquationItems([...equationItems, newItem]);
    setCustomNumber("");
  };

  // Remove item from equation
  const removeEquationItem = (id: string) => {
    setEquationItems(equationItems.filter(item => item.id !== id));
  };

  // Generate unique ID
  const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get equation display text
  const getEquationDisplayText = () => {
    if (equationItems.length === 0) return "No equation defined";
    return equationItems.map(item => item.display).join(" ");
  };

  // Get equation value for saving
  const getEquationValue = () => {
    return equationItems.map(item => {
      if (item.type === "function") {
        return `${item.value}()`;
      }
      return item.value;
    }).join(" ");
  };

  // Save math rule
  const saveMathRule = () => {
    if (!ruleName) {
      toast({
        title: "Validation error",
        description: "Rule name is required",
        variant: "destructive"
      });
      return;
    }

    if (!targetColumn) {
      toast({
        title: "Validation error",
        description: "Target column is required",
        variant: "destructive"
      });
      return;
    }

    if (equationItems.length === 0) {
      toast({
        title: "Validation error",
        description: "Equation cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you would save the math rule to your backend
    console.log("Math Rule would be saved:", { 
      ruleName, 
      ruleDescription, 
      conditions, 
      targetColumn, 
      equation: getEquationValue() 
    });
    
    toast({
      title: "Rule saved",
      description: `Math rule "${ruleName}" has been saved successfully`,
    });
  };

  // Clear the equation
  const clearEquation = () => {
    setEquationItems([]);
  };


  // 1. First, add this handler function (place it with your other state declarations)
  const handleTestRule = async () => {
    const usedColumns = equationItems
      .filter((item) => item.type === "column")
      .map((item) => item.value);
  
    if (usedColumns.length === 0) {
      toast({
        title: "No columns found",
        description: "Please select columns in your equation.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      console.log("Sending to API:", { columns: usedColumns });

      const response = await fetch("http://localhost:8000/get-first-row/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ columns: usedColumns }),
      });
  
      const data = await response.json();
  
      if (!data || Object.keys(data).length === 0) {
        toast({
          title: "No data found",
          description: "No values available for the selected columns.",
          variant: "destructive",
        });
        return;
      }
  
      // Build equation string with actual values
      const evaluatedString = equationItems
        .map((item) => {
          if (item.type === "column") {
            const val = data[item.value];
            return typeof val === "number" || typeof val === "string"
              ? `(${val})`
              : "0";
          } else {
            return item.value;
          }
        })
        .join(" ");
  
      const result = eval(evaluatedString);
  
      // Format used column values
      const columnDetails = usedColumns
        .map((col) => `${col}: ${data[col]}`)
        .join(" | ");
  
      toast({
        title: "Test Run Successful ✅",
        description: `🧮 Equation: ${evaluatedString}\n\n📊 Column Values: ${columnDetails}\n\n✅ Result: ${result}`,
        duration: 8000,
      });
    } catch (error) {
      console.error("Test rule error:", error);
      toast({
        title: "Test Failed ❌",
        description: "Could not test rule. Check console for details.",
        variant: "destructive",
      });
    }
  };
  
  






  // Generate Python code with math equation
  const getMathRulePython = () => {
    if (!ruleName) return "# Please define a rule name";
    if (equationItems.length === 0) return "# Please define an equation";
    
    let pythonCode = `# Math Rule: ${ruleName}\n`;
    if (ruleDescription) {
      pythonCode += `# Description: ${ruleDescription}\n`;
    }
    
    pythonCode += `\ndef apply_math_rule(df):\n`;
    pythonCode += `    """Apply the ${ruleName} math rule to the dataframe"""\n`;
    
    // If there are conditions
    if (conditions.length > 0 && conditions[0].column) {
      pythonCode += `    # Define mask for filtering rows\n`;
      pythonCode += `    mask = `;
      
      conditions.forEach((condition, index) => {
        if (!condition.column) return;
        
        const op = {
          "equals": "==",
          "not_equals": "!=",
          "greater_than": ">",
          "less_than": "<",
          "contains": ".str.contains"
        }[condition.operator] || "==";
        
        if (index > 0) {
          pythonCode += ` & `;
        }
        
        if (condition.operator === "contains") {
          pythonCode += `(df['${condition.column}']${op}('${condition.value}'))`;
        } else {
          // Check if value is numeric
          const value = isNaN(Number(condition.value)) ? 
            `'${condition.value}'` : condition.value;
          pythonCode += `(df['${condition.column}'] ${op} ${value})`;
        }
      });
      
      pythonCode += `\n\n`;
      pythonCode += `    # Apply math equation to filtered rows\n`;
      pythonCode += `    df.loc[mask, '${targetColumn}'] = ${getEquationDisplayText()}\n`;
    } else {
      pythonCode += `    # Apply math equation to all rows\n`;
      pythonCode += `    df['${targetColumn}'] = ${getEquationDisplayText()}\n`;
    }
    
    pythonCode += `\n    return df`;
    
    return pythonCode;
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Create Math Rules</h1>
      
      <Tabs defaultValue="math-builder">
        <TabsList className="mb-4">
          <TabsTrigger value="math-builder">
            <Calculator className="h-4 w-4 mr-2" />
            Math Rule Builder
          </TabsTrigger>
          <TabsTrigger value="condition-builder">
            <Table className="h-4 w-4 mr-2" />
            Conditions
          </TabsTrigger>
          <TabsTrigger value="preview">Python Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="math-builder">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 col-span-1 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Math Rule Definition</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input 
                    id="rule-name" 
                    placeholder="Enter rule name" 
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="rule-description">Description (Optional)</Label>
                  <Textarea 
                    id="rule-description" 
                    placeholder="Describe what this math rule does" 
                    value={ruleDescription}
                    onChange={(e) => setRuleDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="target-column">Target Column</Label>
                  <Select value={targetColumn} onValueChange={setTargetColumn}>
                    <SelectTrigger id="target-column">
                      <SelectValue placeholder="Select target column" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto">
  {isLoading ? (
    <div className="flex items-center justify-center p-2">
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      <span>Loading columns...</span>
    </div>
  ) : columns.length === 0 ? (
    <div className="p-2 text-sm text-gray-500">No columns available</div>
  ) : (
    columns.map((column) => (
      <SelectItem key={column.name} value={column.name}>
        {column.name} <span className="text-xs text-gray-500">({column.type})</span>
      </SelectItem>
    ))
  )}
</SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">This column will store the result of the equation</p>
                </div>
              </div>
              
              {/* Equation Builder */}
              <div className="mt-6">
                <h3 className="font-medium">Equation Builder</h3>
                <div className="mt-3 p-4 border rounded-md min-h-20 bg-gray-50">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {equationItems.length === 0 ? (
                      <p className="text-gray-400 italic">Your equation will appear here...</p>
                    ) : (
                      equationItems.map((item) => (
                        <Badge 
                          key={item.id} 
                          className={`
                            px-2 py-1 rounded text-white flex items-center gap-1
                            ${item.type === 'column' ? 'bg-blue-500' : ''}
                            ${item.type === 'operator' ? 'bg-purple-500' : ''}
                            ${item.type === 'function' ? 'bg-green-500' : ''}
                            ${item.type === 'number' ? 'bg-gray-700' : ''}
                          `}
                        >
                          {item.display}
                          <button 
                            onClick={() => removeEquationItem(item.id)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearEquation}
                      disabled={equationItems.length === 0}
                    >
                      Clear Equation
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Equation Building Tools */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columns */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Columns</h4>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading columns...</span>
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {columns
                          .filter(col => col.type === "number")
                          .map((column) => (
                          <li key={column.name}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-blue-600"
                              onClick={() => addColumnToEquation(column.name)}
                            >
                              <span className="truncate">{column.name}</span>
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                {/* Operators and Functions */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Operators & Functions</h4>
                  <div className="border rounded-md p-2">
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Operators</h5>
                      <div className="flex flex-wrap gap-1">
                        {mathOperators.map((op) => (
                          <Button 
                            key={op.value}
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 font-medium text-purple-600"
                            onClick={() => addOperatorToEquation(op)}
                          >
                            {op.display}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Functions</h5>
                      <div className="flex flex-wrap gap-1">
                        {mathFunctions.map((func) => (
                          <Button 
                            key={func.value}
                            variant="outline" 
                            size="sm"
                            className="text-green-600" 
                            onClick={() => addFunctionToEquation(func)}
                          >
                            {func.display}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Custom Number Input */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Add Custom Number</h4>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter a number"
                    value={customNumber}
                    onChange={(e) => setCustomNumber(e.target.value)}
                  />
                  <Button 
                    onClick={addNumberToEquation}
                    disabled={!customNumber.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-2">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button 
                  onClick={saveMathRule}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Math Rule
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Rule Preview</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{ruleName || "Unnamed Rule"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Target Column</p>
                  <p className="font-medium">{targetColumn || "Not selected"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Equation</p>
                  <div className="bg-gray-100 p-2 rounded-md mt-1 min-h-10">
                    <p className="font-medium break-words">
                      {getEquationDisplayText()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Conditions</p>
                  <p className="font-medium">
                    {conditions.length > 0 && conditions[0].column
                      ? `${conditions.length} condition(s) applied`
                      : "Applied to all rows"}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
              <Button 
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={handleTestRule}
                disabled={!equationItems || equationItems.length === 0}
              >
                <Play className="h-4 w-4 mr-1" />
                Test Rule
              </Button>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <Calculator className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Math Operations</h4>
                    <p className="text-sm text-blue-700">
                      Create dynamic calculations between columns in your Excel files
                      with this visual equation builder.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="condition-builder">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Define Conditions (Optional)</h2>
            <p className="text-sm text-gray-500 mb-4">
              If conditions are specified, the math equation will only be applied to rows that match these conditions.
              If no conditions are specified, the equation will be applied to all rows.
            </p>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Conditions (IF)</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const newId = conditions.length > 0 ? Math.max(...conditions.map(c => c.id)) + 1 : 1;
                    setConditions([...conditions, { id: newId, column: "", operator: "equals", value: "" }]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Condition
                </Button>
              </div>
              
              {conditions.map((condition) => (
                <div 
                  key={condition.id} 
                  className="flex gap-2 items-center mb-4"
                >
                  <div className="flex-1">
                    <Label className="sr-only">Column</Label>
                    <Select 
                      value={condition.column}
                      onValueChange={(value) => {
                        setConditions(conditions.map(c => 
                          c.id === condition.id ? { ...c, column: value } : c
                        ));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading columns...</span>
                          </div>
                        ) : columns.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">No columns available</div>
                        ) : (
                          columns.map((column) => (
                            <SelectItem key={column.name} value={column.name}>
                              {column.name} <span className="text-xs text-gray-500">({column.type})</span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-32">
                    <Label className="sr-only">Operator</Label>
                    <Select 
                      value={condition.operator}
                      onValueChange={(val) => {
                        setConditions(conditions.map(c => 
                          c.id === condition.id ? { ...c, operator: val } : c
                        ));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="greater_than">greater than</SelectItem>
                        <SelectItem value="less_than">less than</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <Label className="sr-only">Value</Label>
                    <Input 
                      placeholder="Value" 
                      value={condition.value}
                      onChange={(e) => {
                        setConditions(conditions.map(c => 
                          c.id === condition.id ? { ...c, value: e.target.value } : c
                        ));
                      }}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (conditions.length > 1) {
                        setConditions(conditions.filter(c => c.id !== condition.id));
                      } else {
                        setConditions([{ id: 1, column: "", operator: "equals", value: "" }]);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Python Code</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">
                <code>{getMathRulePython()}</code>
              </pre>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                This is the Python code that would be generated from your math rule definition. 
                In a complete implementation, this code would be executed on your uploaded 
                Excel files to process data according to your math equation.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateRules;