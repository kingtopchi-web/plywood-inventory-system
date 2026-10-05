import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageOpen, ArrowLeft, Plus, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardBody } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';

export const ModulePlaceholder = ({ title, description, moduleName }) => {
  const navigate = useNavigate();

  return (
    <div className="module-view-container">
      <PageHeader
        title={title}
        subtitle={description}
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft size={15} />}
              onClick={() => navigate('/admin/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
              onClick={() => alert(`${title} creation form will open in the next phase.`)}
            >
              New Entry
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody>
          <EmptyState
            icon={PackageOpen}
            title={`No ${title} Recorded Yet`}
            description={`The database collection is currently pristine with zero records. All backend Mongoose schemas and validation rules are configured.`}
            action={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    background: 'rgba(67, 24, 255, 0.1)',
                    border: '1px solid rgba(67, 24, 255, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--color-primary)',
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Backend Schema & Architecture Ready</span>
                </div>
              </div>
            }
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default ModulePlaceholder;
