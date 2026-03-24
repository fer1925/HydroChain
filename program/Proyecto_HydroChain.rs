use anchor_lang::prelude::*;

declare_id!("HS3gwn2BWVDx6Qv47TFq57WaYbgGVFGr5MJV6hTXdSkf");

#[program]
pub mod smart_home_system {
    use super::*;

    pub fn crear_sistema(ctx: Context<NuevoSistema>, nombre: String) -> Result<()> {
        let owner_id = ctx.accounts.owner.key();
        let lecturas: Vec<Lectura> = vec![];

        ctx.accounts.sistema.set_inner(Sistema {
            owner: owner_id,
            nombre,
            lecturas,
            config: Config {
                irrigation_threshold: 50.0,
                temperature_max: 30.0,
                light_auto: true,
            },
            irrigation_active: false,
            ventilation_active: false,
            lights_on: false,
        });
        Ok(())
    }

    pub fn agregar_lectura(
        ctx: Context<NuevaLectura>,
        temperatura: f32,
        humedad: f32,
        nivel_agua: f32,
        flujo_agua: f32,
        nota: String,
    ) -> Result<()> {
        require!(
            ctx.accounts.sistema.owner == ctx.accounts.owner.key(),
            Errores::NoEresElOwner
        );

        let lectura = Lectura {
            temperatura,
            humedad,
            nivel_agua,
            flujo_agua,
            nota,
            timestamp: Clock::get()?.unix_timestamp,
        };

        ctx.accounts.sistema.lecturas.push(lectura);

        // lógica automática
        ctx.accounts.sistema.irrigation_active =
            humedad < ctx.accounts.sistema.config.irrigation_threshold;
        ctx.accounts.sistema.ventilation_active =
            temperatura > ctx.accounts.sistema.config.temperature_max;
        if ctx.accounts.sistema.config.light_auto {
            ctx.accounts.sistema.lights_on = true;
        }

        Ok(())
    }

    pub fn actualizar_config(
        ctx: Context<NuevaLectura>,
        hum_umbral: f32,
        temp_max: f32,
        luz_auto: bool,
    ) -> Result<()> {
        require!(
            ctx.accounts.sistema.owner == ctx.accounts.owner.key(),
            Errores::NoEresElOwner
        );

        ctx.accounts.sistema.config.irrigation_threshold = hum_umbral;
        ctx.accounts.sistema.config.temperature_max = temp_max;
        ctx.accounts.sistema.config.light_auto = luz_auto;

        Ok(())
    }

    pub fn control_manual(
        ctx: Context<NuevaLectura>,
        irrigation: bool,
        ventilation: bool,
        lights: bool,
    ) -> Result<()> {
        require!(
            ctx.accounts.sistema.owner == ctx.accounts.owner.key(),
            Errores::NoEresElOwner
        );

        ctx.accounts.sistema.irrigation_active = irrigation;
        ctx.accounts.sistema.ventilation_active = ventilation;
        ctx.accounts.sistema.lights_on = lights;

        Ok(())
    }
}

#[error_code]
pub enum Errores {
    #[msg("Error, no eres el propietario de la cuenta.")]
    NoEresElOwner,
}

#[account]
#[derive(InitSpace)]
pub struct Sistema {
    owner: Pubkey,

    #[max_len(60)]
    nombre: String,

    #[max_len(20)]
    lecturas: Vec<Lectura>,

    config: Config,
    irrigation_active: bool,
    ventilation_active: bool,
    lights_on: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace, PartialEq, Debug)]
pub struct Lectura {
    temperatura: f32,
    humedad: f32,
    nivel_agua: f32,
    flujo_agua: f32,
    #[max_len(100)]
    nota: String,
    timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace, PartialEq, Debug)]
pub struct Config {
    irrigation_threshold: f32,
    temperature_max: f32,
    light_auto: bool,
}

#[derive(Accounts)]
pub struct NuevoSistema<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = Sistema::INIT_SPACE + 8,
        seeds = [b"sistema", owner.key().as_ref()],
        bump
    )]
    pub sistema: Account<'info, Sistema>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct NuevaLectura<'info> {
    pub owner: Signer<'info>,

    #[account(mut)]
    pub sistema: Account<'info, Sistema>,
}
