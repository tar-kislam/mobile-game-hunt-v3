"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon, 
  LockIcon, 
  ClockIcon, 
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react'

interface PaymentPlaceholderProps {
  campaignId: string
  campaignName: string
  amount: number
  currency?: string
}

export default function PaymentPlaceholder({ 
  campaignId, 
  campaignName, 
  amount, 
  currency = 'USD' 
}: PaymentPlaceholderProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handlePayment = async () => {
    setPaymentStatus('processing')
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          paymentMethod: 'stripe'
        })
      })

      if (response.ok) {
        setPaymentStatus('completed')
      } else {
        setPaymentStatus('error')
      }
    } catch (error) {
      setPaymentStatus('error')
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-yellow-400 animate-spin" />
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />
      case 'error':
        return <AlertCircleIcon className="h-6 w-6 text-red-400" />
      default:
        return <CreditCardIcon className="h-6 w-6 text-purple-400" />
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing payment...'
      case 'completed':
        return 'Payment processed successfully!'
      case 'error':
        return 'Payment failed. Please try again.'
      default:
        return 'Payment integration coming soon'
    }
  }

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'text-yellow-400'
      case 'completed':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {getStatusIcon()}
          </motion.div>
        </div>
        <CardTitle className="text-xl text-white">Campaign Payment</CardTitle>
        <p className="text-gray-400 text-sm mt-2">{campaignName}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">
            {formatCurrency(amount)}
          </div>
          <Badge variant="secondary" className="text-xs">
            {currency}
          </Badge>
        </div>

        {/* Status Message */}
        <motion.div
          key={paymentStatus}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className={`text-sm ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
        </motion.div>

        {/* Payment Methods Placeholder */}
        {paymentStatus === 'idle' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 p-3 border border-gray-600 rounded-lg bg-gray-700/30">
              <CreditCardIcon className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">Credit Card (Coming Soon)</span>
              <LockIcon className="h-4 w-4 text-gray-500" />
            </div>
            
            <div className="flex items-center justify-center gap-3 p-3 border border-gray-600 rounded-lg bg-gray-700/30">
              <div className="h-5 w-5 bg-orange-400 rounded"></div>
              <span className="text-gray-300">PayPal (Coming Soon)</span>
              <LockIcon className="h-4 w-4 text-gray-500" />
            </div>
            
            <div className="flex items-center justify-center gap-3 p-3 border border-gray-600 rounded-lg bg-gray-700/30">
              <div className="h-5 w-5 bg-purple-400 rounded"></div>
              <span className="text-gray-300">Stripe (Coming Soon)</span>
              <LockIcon className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-3">
          {paymentStatus === 'idle' && (
            <Button 
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Process Payment (Demo)
            </Button>
          )}

          {paymentStatus === 'completed' && (
            <Button 
              onClick={() => setPaymentStatus('idle')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:text-white"
            >
              Make Another Payment
            </Button>
          )}

          {paymentStatus === 'error' && (
            <Button 
              onClick={handlePayment}
              variant="outline"
              className="w-full border-red-600 text-red-300 hover:text-red-200"
            >
              Retry Payment
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <LockIcon className="h-3 w-3" />
            <span>Secure payment processing coming soon</span>
          </div>
        </div>

        {/* Integration Notice */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-300 text-center">
            <strong>Integration Status:</strong> Payment processing integration is currently in development. 
            This is a placeholder demonstration.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
