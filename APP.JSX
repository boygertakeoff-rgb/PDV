import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Lock, DollarSign, CreditCard, LogOut, Package, BarChart2, Printer, Camera, X } from 'lucide-react';

// ==========================================
// COMPONENTE: SCANNER DE CÂMARA
// ==========================================
function CameraScannerModal({ isOpen, onClose, onScanSuccess }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    let stream = null;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Erro ao aceder à câmara:", err);
        alert("Não foi possível aceder à câmara do dispositivo.");
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-96 space-y-4 shadow-2xl relative">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Camera size={20} className="text-orange-600" /> Scanner de Câmara
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="relative bg-black rounded-xl overflow-hidden h-64 flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-2 border-orange-500 border-dashed m-8 rounded-lg pointer-events-none opacity-70"></div>
        </div>

        <p className="text-xs text-center text-gray-500">
          Aponte a câmara para o código de barras do produto.
        </p>

        <button
          onClick={() => {
            onScanSuccess({ id: 1, barcode: '7891001', name: 'Prato de Plástico P', price: 15.00 });
            onClose();
          }}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow transition"
        >
          Simular Leitura de Produto
        </button>
      </div>
    </div>
  );
}

// ==========================================
// APLICAÇÃO PRINCIPAL: DASS-MC
// ==========================================
export default function DassMCCompleteSystem() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [operatorCode, setOperatorCode] = useState('');
  const [operatorPin, setOperatorPin] = useState('');
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setItemsCart] = useState([]);
  
  const [products] = useState([
    { id: 1, barcode: '7891001', name: 'Prato de Plástico P', category: 'Utensílios', price: 15.00, stock: 45 },
    { id: 2, barcode: '7891002', name: 'Tigela Oval 6.2', category: 'Utensílios', price: 20.00, stock: 30 },
    { id: 3, barcode: '7891003', name: 'Chaleira de Plástico', category: 'Eletro/Casa', price: 45.00, stock: 15 },
    { id: 4, barcode: '7891004', name: 'Copo de Água R', category: 'Utensílios', price: 10.00, stock: 100 }
  ]);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-800">Dass-MC POS</h1>
            <p className="text-sm text-gray-500">Sistema Profissional de Retalho</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600">Nº de Trabalho / Operador</label>
              <input
                type="text"
                value={operatorCode}
                onChange={(e) => setOperatorCode(e.target.value)}
                placeholder="Ex: 1001"
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600">Senha / PIN</label>
              <input
                type="password"
                value={operatorPin}
                onChange={(e) => setOperatorPin(e.target.value)}
                placeholder="••••"
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <button
              onClick={() => {
                if (operatorCode === '1001') setIsAuthenticated(true);
                else alert('Utilize o código 1001 (operador padrão do sistema)[cite: 1].');
              }}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg shadow-lg transition"
            >
              ENTRAR NO CAIXA
            </button>
          </div>
        </div>
      </div>
    );
  }

  const addToCart = (product) => {
    const exists = cart.find(item => item.id === product.id);
    if (exists) {
      setItemsCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setItemsCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalDaySales = salesHistory.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="flex h-screen bg-gray-100 font-sans select-none">
      <div className="w-20 bg-slate-900 text-white flex flex-col items-center py-4 space-y-6">
        <div className="font-black text-xl text-orange-500">Dass</div>
        <button 
          onClick={() => setActiveTab('pos')}
          className={`p-3 rounded-lg transition ${activeTab === 'pos' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <ShoppingCart size={22} />
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`p-3 rounded-lg transition ${activeTab === 'reports' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <BarChart2 size={22} />
        </button>
        <button className="mt-auto p-3 text-red-400 hover:bg-slate-800 rounded-lg" onClick={() => setIsAuthenticated(false)}>
          <LogOut size={22} />
        </button>
      </div>

      {activeTab === 'pos' ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-96 bg-white border-r flex flex-col justify-between">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-gray-800">Caixa Ativo</h2>
                <p className="text-xs text-gray-500">Operador: 1001[cite: 1]</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">Online</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 mt-20 text-sm">Selecione produtos ou use o leitor de câmara</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.qty}x R$ {item.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm">R$ {(item.qty * item.price).toFixed(2)}</span>
                      <button onClick={() => setItemsCart(cart.filter(i => i.id !== item.id))} className="text-red-500 font-bold px-2">×</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 space-y-3">
              <div className="flex justify-between text-xl font-black">
                <span>Total:</span>
                <span className="text-orange-600">R$ {total.toFixed(2)}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => setIsPaymentOpen(true)}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow transition"
              >
                PAGAR AGORA
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b p-4 flex justify-between items-center">
              <div className="flex space-x-2">
                {['Todos', 'Utensílios', 'Eletro/Casa', 'Limpeza'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 transition"
                >
                  <Camera size={16} /> Ler com Câmara
                </button>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Pesquisar produto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto grid grid-cols-3 gap-4">
              {products.filter(p => selectedCategory === 'Todos' || p.category === selectedCategory).map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between h-36"
                >
                  <div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{product.category}</span>
                    <h3 className="font-bold text-gray-800 mt-2 text-sm">{product.name}</h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-600 font-extrabold">R$ {product.price.toFixed(2)}</span>
                    <span className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded font-bold">+ Adicionar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-gray-800">Fecho de Caixa e Relatórios</h2>
              <p className="text-sm text-gray-500">Resumo financeiro do turno atual</p>
            </div>
            <button 
              onClick={() => window.print()}
              className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center space-x-2 shadow hover:bg-slate-800"
            >
              <Printer size={18} />
              <span>Imprimir Fecho de Caixa</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Total Faturado</span>
              <div className="text-3xl font-black text-orange-600">R$ {totalDaySales.toFixed(2)}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Vendas Realizadas</span>
              <div className="text-3xl font-black text-gray-800">{salesHistory.length}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Operador</span>
              <div className="text-2xl font-bold text-gray-800">1001[cite: 1]</div>
            </div>
          </div>
        </div>
      )}

      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(scannedProduct) => addToCart(scannedProduct)}
      />

      {isPaymentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800">Pagamento da Venda</h3>
            <p className="text-sm text-gray-500">Total a Pagar: <strong className="text-gray-800">R$ {total.toFixed(2)}</strong></p>

            <div>
              <label className="text-xs font-bold text-gray-600">Dinheiro Recebido (R$)</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 p-3 border rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {Number(cashReceived) >= total && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold text-center text-sm">
                Troco a Devolver: R$ {(Number(cashReceived) - total).toFixed(2)}
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="flex-1 py-3 border rounded-lg text-gray-600 font-semibold hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const newSaleRecord = {
                    id: Date.now().toString().slice(-6),
                    time: new Date().toLocaleTimeString(),
                    itemsCount: cart.reduce((acc, i) => acc + i.qty, 0),
                    total: total
                  };
                  setSalesHistory([newSaleRecord, ...salesHistory]);
                  setItemsCart([]);
                  setIsPaymentOpen(false);
                  setCashReceived('');
                  setTimeout(() => window.print(), 300);
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow"
              >
                Concluir e Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="printable-receipt" className="hidden">
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>DASS-MC POS</h2>
          <p style={{ margin: 2, fontSize: '10px' }}>Loja Matriz - Sistema SaaS</p>
          <p style={{ margin: 2, fontSize: '10px' }}>Data: {new Date().toLocaleString()}</p>
        </div>
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0', marginBottom: '10px' }}>
          {cart.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
              <span>{item.qty}x {item.name}</span>
              <span>R$ {(item.qty * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>TOTAL:</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
          <p>Operador: 1001[cite: 1]</p>
          <p>Obrigado pela preferência!</p>
        </div>
      </div>
    </div>
  );
}
