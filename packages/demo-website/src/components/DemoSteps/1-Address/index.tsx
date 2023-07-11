import { Component, on, createEffect, createSignal } from 'solid-js';

import { createForm } from 'grapos/Form/Form';
import { FormProviderValue } from 'grapos/Form/FormContext';
import Validators from 'grapos/Form/Validators';
import { Col, Row } from 'grapos/Layout/Grid';
import { GrowFade } from 'grapos/Transitions';
import { Tooltip } from 'grapos/DataDisplay';

export type AddressFormValue = {
  cidade: string;
  rua: string;
  uf: string;
  numero: number;
  cep: string;
  bairro: string;

  togglerVal: boolean;
};

const Address: Component<{
  ref?: (formProviderValue: FormProviderValue<AddressFormValue>) => void;
}> = (props) => {
  const AddressForm = createForm<AddressFormValue>('AddressForm', {});

  const [cepInput, setCEPInput] = createSignal<HTMLElement>();
  const [hoveringCEPInput, setHoveringCEPInput] = createSignal(false);
  const [cepInputTooltipPosition, setCepInputTooltipPosition] =
    createSignal('bottom');

  createEffect(
    on(hoveringCEPInput, () => {
      const rng = Math.random();

      if (rng < 0.25) {
        setCepInputTooltipPosition('left');
      } else if (rng < 0.5) {
        setCepInputTooltipPosition('top');
      } else if (rng < 0.75) {
        setCepInputTooltipPosition('right');
      } else if (rng < 1) {
        setCepInputTooltipPosition('bottom');
      }
    })
  );

  return (
    <AddressForm ref={props.ref}>
      <Row>
        <Col size={16}>
          <AddressForm.Input
            name="cidade"
            label="Cidade"
            type="text"
            placeholder="São Paulo"
            validators={[Validators.required]}
          />
        </Col>
        <Col size={8}>
          <AddressForm.Select
            name="uf"
            label="UF"
            validators={[Validators.required]}
          >
            <AddressForm.Select.Option value="pe">PE</AddressForm.Select.Option>
            <AddressForm.Select.Option value="mg">MG</AddressForm.Select.Option>
            <AddressForm.Select.Option value="pr">PR</AddressForm.Select.Option>
            <AddressForm.Select.Option value="rj">RJ</AddressForm.Select.Option>
            <AddressForm.Select.Option value="sp">SP</AddressForm.Select.Option>
          </AddressForm.Select>
        </Col>

        <Col size={16}>
          <AddressForm.Input
            name="rua"
            label="Rua"
            validators={[Validators.required]}
          />
        </Col>
        <Col size={8}>
          <AddressForm.Input
            type="number"
            name="numero"
            placeholder="513"
            label="N°"
            validators={[Validators.required]}
          />
        </Col>

        <Col size={16}>
          <AddressForm.Input
            name="bairro"
            label="Bairro"
            placeholder="Butantã Morumbi"
            validators={[Validators.required]}
          />
        </Col>
        <Col size={8}>
          <AddressForm.Input
            ref={setCEPInput}
            name="cep"
            placeholder="99999-999"
            mask="99999-999"
            label="CEP"
            onMouseEnter={() => setHoveringCEPInput(true)}
            onMouseLeave={() => setHoveringCEPInput(false)}
            validators={[Validators.required]}
          />

          <GrowFade growingOrigin="left">
            <Tooltip
              identification="CEP tooltip"
              anchor={cepInput()!}
              position={cepInputTooltipPosition() as any}
              visible={hoveringCEPInput()}
            >
              Porfavor, use um CEP valido
            </Tooltip>
          </GrowFade>
        </Col>
      </Row>
    </AddressForm>
  );
};

export default Address;