'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FlowWithSteps } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

interface FlowSelectorProps {
  flows: FlowWithSteps[]
}

export function FlowSelector({ flows }: FlowSelectorProps) {
  const [selectedFlow, setSelectedFlow] = useState<FlowWithSteps | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const handleFlowSelect = (flow: FlowWithSteps) => {
    setSelectedFlow(flow)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (selectedFlow && currentStep < selectedFlow.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (flows.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No flows available for this dapp yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className="group cursor-pointer overflow-hidden rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
            onClick={() => handleFlowSelect(flow)}
          >
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-3">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{flow.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {flow.steps.length} steps
                </p>
              </div>
            </div>
            
            {flow.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {flow.description}
              </p>
            )}
            
            <div className="flex -space-x-2">
              {flow.steps.slice(0, 3).map((step, index) => (
                <div key={step.id} className="relative w-12 h-16 rounded border-2 border-background overflow-hidden">
                  <Image
                    src={step.image.url}
                    alt={`Step ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {flow.steps.length > 3 && (
                <div className="flex items-center justify-center w-12 h-16 rounded border-2 border-background bg-muted text-xs font-medium">
                  +{flow.steps.length - 3}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Flow Viewer Modal */}
      <Dialog open={!!selectedFlow} onOpenChange={() => setSelectedFlow(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedFlow && (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>{selectedFlow.name}</DialogTitle>
                {selectedFlow.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedFlow.description}
                  </p>
                )}
              </DialogHeader>
              
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {selectedFlow.steps.length}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextStep}
                      disabled={currentStep === selectedFlow.steps.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 relative">
                  {selectedFlow.steps[currentStep] && (
                    <Image
                      src={selectedFlow.steps[currentStep].image.url}
                      alt={`Step ${currentStep + 1}`}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex space-x-1">
                    {selectedFlow.steps.map((_, index) => (
                      <button
                        key={index}
                        className={`flex-1 h-2 rounded ${
                          index === currentStep ? 'bg-primary' : 'bg-muted'
                        }`}
                        onClick={() => setCurrentStep(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}